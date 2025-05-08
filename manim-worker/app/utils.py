import os
import re
import ast
import uuid
import boto3
import requests
from botocore.exceptions import ClientError
from typing import Optional, Tuple, Dict, Any
import time
from .config import (
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    AWS_S3_BUCKET_NAME,
    TEMP_DIR,
    WEBHOOK_ENABLED,
    WEBHOOK_URL
)
from prisma import Prisma

async def put_in_db(video_url:str,prompt_id:str) -> bool:
    db = Prisma()
    await db.connect()

    
    print(db)
    try:
        edit_prompt = await db.prompt.update(where={"id":prompt_id},data={
            "videoUrl":video_url
        })
        await db.disconnect()
        return True
    except Exception as e:  
        print(f"Error occurred in db call: {str(e)}")
        await db.disconnect()
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
    os.makedirs(TEMP_DIR, exist_ok=True)
     
    file_id = str(uuid.uuid4().hex)  
    file_path = os.path.join(TEMP_DIR, f"{file_id}.py")
    
    file_path = os.path.abspath(file_path)
    
    with open(file_path, 'w') as f:
        f.write(code)
        f.flush()
        os.fsync(f.fileno())  

    os.chmod(file_path, 0o644)      
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Failed to create temp file at {file_path}")
    
    time.sleep(0.5)    
    return file_path


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