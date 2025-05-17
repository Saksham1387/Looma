import os
import re
import ast
import uuid
import boto3
import requests
from botocore.exceptions import ClientError
from typing import Optional, Tuple, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from .config import (
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    AWS_S3_BUCKET_NAME,
    WEBHOOK_ENABLED,
    WEBHOOK_URL,
    DATABASE_URL
)
import logging
import os

logger = logging.getLogger("manim-worker")


engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_pre_ping=True,
    connect_args={
        "application_name": "manim_worker",
        "options": "-c statement_timeout=60000 -c client_encoding=utf8"  
    }
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def put_in_db(video_url, prompt_id):
    """
    Store the video URL in the database using SQLAlchemy
    """
    logger.info("Putting in db")
    try:
        
        db = SessionLocal()
        try:
            
            update_query = text("""
                UPDATE public."Prompt" 
                SET "videoUrl" = :video_url 
                WHERE id = :prompt_id
            """)
            db.execute(update_query, {"video_url": video_url, "prompt_id": prompt_id})
            db.commit()
            
            logger.info(f"Successfully updated prompt {prompt_id} with video URL {video_url}")
            return True
            
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return False

def extract_scene_name(code: str) -> Optional[str]:
    """Extract the first class name that inherits from Scene from the Manim code."""
    pattern = r"class\s+(\w+)\s*\(\s*Scene\s*\):"
    match = re.search(pattern, code)
    return match.group(1) if match else None


def validate_manim_code(code: str) -> Tuple[bool, Optional[str]]:
    """Validate the Manim code for syntax errors."""
    try:
        ast.parse(code)
        return True, None
    except SyntaxError as e:
        error_message = f"Syntax error in provided code: {str(e)} (line {e.lineno})"
        return False, error_message

def create_temp_file(code):
    """Create a temporary file with the provided code and ensure it exists"""
    temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp")
    
    os.makedirs(temp_dir, exist_ok=True)
    
    filename = f"{uuid.uuid4().hex}.py"
    file_path = os.path.join(temp_dir, filename)
    
    try:
        
        with open(file_path, 'w') as f:
            f.write(code)
            f.flush()
            os.fsync(f.fileno())  
            
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found after creation: {file_path}")
        
        if os.path.getsize(file_path) == 0:
            raise IOError(f"File was created but contains no data: {file_path}")
            
        logger.info(f"Created temporary file at {file_path}")
        return file_path
        
    except Exception as e:
        logger.error(f"Error creating temporary file: {str(e)}")
        raise


def upload_to_s3(file_path: str, content_type: str = "video/mp4") -> Tuple[bool, str]:
    """Upload a file to S3 bucket and return the URL."""
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )
        
        file_name = os.path.basename(file_path)
        s3_key = f"videos/{uuid.uuid4().hex}_{file_name}"
        
        s3_client.upload_file(
            file_path,
            AWS_S3_BUCKET_NAME,
            s3_key,
            ExtraArgs={"ContentType": content_type}
        )
        
        s3_url = f"https://{AWS_S3_BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
        return True, s3_url
    
    except ClientError as e:
        return False, f"Failed to upload to S3: {str(e)}"


def cleanup_files(file_paths: list) -> None:
    """Remove temporary files."""
    for file_path in file_paths:
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass


def send_webhook_notification(webhook_url: str, data: Dict[str, Any]) -> bool:
    """Send a webhook notification with the task result."""
    if not webhook_url:
        return False
    
    try:
        response = requests.post(
            webhook_url,
            json=data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        return response.status_code == 200
    except Exception:
        return False


def notify_task_completion(task_id: str, status: str, result: Dict[str, Any] = None, 
                           error: str = None, webhook_url: str = None) -> None:
    """Send task completion notification via webhook."""
    if not WEBHOOK_ENABLED and not webhook_url:
        return
    
    url = webhook_url or WEBHOOK_URL
    if not url:
        return
    
    data = {
        "task_id": task_id,
        "status": status,
        "result": result,
        "error": error
    }
    
    send_webhook_notification(url, data)