import os
import subprocess
import traceback
import logging
from threading import Thread
from celery import Celery

from .models import TaskStatus
from .utils import (
    extract_scene_name,
    create_temp_file,
    upload_to_s3,
    cleanup_files,
    notify_task_completion,
    put_in_db
)
from .config import (
    MEDIA_DIR, 
    REDIS_HOST, 
    REDIS_PORT, 
    REDIS_DB, 
    REDIS_PASSWORD,
)
import json

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = Celery("manim-worker")

app.conf.broker_url = f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'
app.conf.result_backend = f'redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'

app.conf.task_track_started = True
app.conf.task_time_limit = 300  
app.conf.worker_prefetch_multiplier = 1  
app.conf.task_acks_late = True 

logger = logging.getLogger("manim-worker")

# Import here to avoid circular imports
from .task_queue import queue

@app.task(bind=True)
def process_manim_task(self, task_id, code, prompt_id, scene_name=None, webhook_url=None):
    """Process a Manim rendering task using Celery"""
    file_path = None
    video_path = None

    try:
        logger.info(f"Starting Manim rendering task {task_id}")
    
        queue.update_task_status(task_id, TaskStatus.PROCESSING)
        
        if not scene_name:
            scene_name = extract_scene_name(code)
            if not scene_name:
                error_msg = "Could not determine scene name. Ensure code defines a Scene class."
                logger.error(error_msg)
                queue.update_task_status(task_id, TaskStatus.FAILED, error=error_msg)
                notify_task_completion(
                    task_id=task_id,
                    status="failed",
                    error=error_msg,
                    webhook_url=webhook_url
                )
                return
        
        try:
            file_path = create_temp_file(code)
            logger.info(f"Created temporary file at {file_path}")
            
            # Verify file exists before proceeding
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File was created but doesn't exist at {file_path}")
                
        except Exception as e:
            error_msg = f"Failed to create temporary file: {str(e)}"
            logger.error(error_msg)
            queue.update_task_status(task_id, TaskStatus.FAILED, error=error_msg)
            notify_task_completion(
                task_id=task_id,
                status="failed",
                error=error_msg,
                webhook_url=webhook_url
            )
            return
        
        result = subprocess.run(
            ["manim", "-ql", file_path, scene_name],
            capture_output=True,
            text=True,
            timeout=180 
        )
        
        if result.returncode != 0:
            error_message = f"Manim failed:\nSTDERR: {result.stderr}\nSTDOUT: {result.stdout}"
            logger.error(error_message)
            queue.update_task_status(task_id, TaskStatus.FAILED, error=error_message)
            notify_task_completion(
                task_id=task_id,
                status="failed",
                error=error_message,
                webhook_url=webhook_url
            )
            return
        
        video_file = f"{scene_name}.mp4"
        video_path = os.path.join(MEDIA_DIR, "videos", os.path.basename(file_path).split('.')[0], "480p15", video_file)
        if not os.path.exists(video_path):
            # Try alternative path
            video_path = os.path.join("media", "videos", "main", "480p15", video_file)
            
        if not os.path.exists(video_path):
            error_message = f"Video file not found after successful rendering"
            logger.error(error_message)
            queue.update_task_status(task_id, TaskStatus.FAILED, error=error_message)
            notify_task_completion(
                task_id=task_id,
                status="failed",
                error=error_message,
                webhook_url=webhook_url
            )
            return
        
        logger.info(f"Video generated at {video_path}")
        
        success, result_or_error = upload_to_s3(video_path)
        if not success:
            logger.error(result_or_error)
            queue.update_task_status(task_id, TaskStatus.FAILED, error=result_or_error)
            notify_task_completion(
                task_id=task_id,
                status="failed",
                error=result_or_error,
                webhook_url=webhook_url
            )
            return
            
        logger.info(f"Video uploaded to {result_or_error}")
        
        # Update database with video URL
        logger.info("Attempting to update database with video URL")
        db_res = put_in_db(result_or_error, prompt_id)
        
        if not db_res:
            logger.error("Database update failed")
            queue.update_task_status(task_id, TaskStatus.FAILED, error="Database error")
            notify_task_completion(
                task_id=task_id,
                status="failed",
                error="Database error",
                webhook_url=webhook_url
            )
            return
        
        logger.info("Database update successful")
        
        logger.info("Updating task status and result")
        queue.update_task_status(
            task_id, 
            TaskStatus.COMPLETED, 
            result={"video_url": result_or_error}
        )
        logger.info("Task status and result updated successfully")

        notify_task_completion(
            task_id=task_id,
            status="completed",
            result={"video_url": result_or_error},
            webhook_url=webhook_url
        )
        
    except subprocess.TimeoutExpired:
        error_msg = "Manim execution timed out"
        logger.error(error_msg)
        queue.update_task_status(task_id, TaskStatus.FAILED, error=error_msg)
        notify_task_completion(
            task_id=task_id, 
            status="failed", 
            error=error_msg,
            webhook_url=webhook_url
        )
        
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        queue.update_task_status(task_id, TaskStatus.FAILED, error=error_msg)
        notify_task_completion(
            task_id=task_id, 
            status="failed", 
            error=error_msg,
            webhook_url=webhook_url
        )
        
    finally:
        # Clean up files
        cleanup_files([file_path, video_path])


def start_worker():
    from celery.bin import worker
    
    worker = worker.worker(app=app)
    worker.run(concurrency=1,loglevel="INFO")
    
    
if __name__ == "__main__":
    start_worker()