import os
import time
import subprocess
import traceback
import logging
import argparse
from threading import Thread
from .task_queue import queue
from .models import TaskStatus
from .utils import (
    extract_scene_name,
    create_temp_file,
    upload_to_s3,
    cleanup_files,
    notify_task_completion,
    put_in_db
)
from .config import MEDIA_DIR, NUM_WORKERS
import sys
from pathlib import Path
import asyncio

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger("manim-worker")

async def process_task(task):
    task_id = task.id
    code = task.code
    prompt_id = task.prompt_id
    scene_name = task.scene_name
    webhook_url = task.webhook_url
    file_path = None
    video_path = None

    try:
        logger.info(f"Starting Manim rendering task {task_id}")
        
        queue.update_task_status(task_id,TaskStatus.PROCESSING)
        
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
        # file_path = create_temp_file(code)
        # logger.info(f"Created temporary file at {file_path}")
        
        # logger.info(f"Running Manim for scene: {scene_name}")
        
        
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
        db_res = await put_in_db(result_or_error,prompt_id)
        
        if not db_res:
            logger.error("Db Error occured")
            queue.update_task_status(task_id, TaskStatus.FAILED, error="Db error")
            notify_task_completion(
                task_id=task_id,
                status="failed",
                error=result_or_error,
                webhook_url=webhook_url
            )
            return
        
        # Update task status and result
        queue.update_task_status(
            task_id, 
            TaskStatus.COMPLETED, 
            result={"video_url": result_or_error}
        )
        
        # Send webhook notification if configured
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

async def worker_loop():
    while True:
        try:
            task = queue.wait_for_task()
            
            if task:
                await process_task(task)
            
        except Exception as e:
            logger.error(f"Error in worker loop: {str(e)}")
            logger.error(traceback.format_exc())
            
            time.sleep(1)

def run_worker_loop():
    asyncio.run(worker_loop())


async def start_workers(num_workers):
    logger.info(f"Starting {num_workers} worker threads")
    
    for i in range(num_workers):
        worker_thread = Thread(
            target=run_worker_loop,
            name=f"worker-{i}",
            daemon=True
        )
        worker_thread.start()


if __name__ == "__main__":
    current_dir = Path(__file__).parent
    parent_dir = current_dir.parent
    sys.path.append(str(parent_dir))
