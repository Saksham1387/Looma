from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import subprocess
import os
import shutil
import uuid
from contextlib import asynccontextmanager
import boto3
from botocore.exceptions import ClientError
import re
from fastapi.middleware.cors import CORSMiddleware
import ast
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ManimCode(BaseModel):
    code: str
    scene_name: str | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):

    os.makedirs("temp", exist_ok=True)
    yield

    if os.path.exists("temp"):
        shutil.rmtree("temp")


app.lifespan = lifespan

def extract_scene_name(code: str) -> str | None:
    """Extract the first class name that inherits from Scene from the Manim code."""
    pattern = r"class\s+(\w+)\s*\(\s*Scene\s*\):"
    match = re.search(pattern, code)
    return match.group(1) if match else None

@app.post("/run-manim")
async def run_manim(data: ManimCode):
    file_path = None
    video_path = None
    try:

        try:
            ast.parse(data.code)
        except SyntaxError as e:
            error_message = f"Syntax error in provided code: {str(e)} (line {e.lineno})"
            print(error_message)
            return JSONResponse({"error": error_message}, status_code=400)


        temp_dir = "temp"
        os.makedirs(temp_dir, exist_ok=True)


        file_path = os.path.join(temp_dir, "main.py")
        with open(file_path, "w") as f:
            f.write(data.code)


        scene_name = data.scene_name or extract_scene_name(data.code)
        if not scene_name:
            return JSONResponse({"error": "Could not determine scene name. Specify 'scene_name' or ensure code defines a Scene class."}, status_code=400)


        result = subprocess.run(
            ["manim", "-ql", file_path, scene_name],
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode != 0:
            error_message = f"Manim failed:\nSTDERR: {result.stderr}\nSTDOUT: {result.stdout}"
            print(error_message)
            return JSONResponse({"error": error_message}, status_code=400)


        video_file = f"{scene_name}.mp4"
        video_path = os.path.join("media", "videos", "main", "480p15", video_file)
        if not os.path.exists(video_path):
            error_message = f"Video file not found at {video_path}"
            print(error_message)
            return JSONResponse({"error": error_message}, status_code=500)


        aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        aws_region = os.getenv('AWS_REGION')
        bucket_name = os.getenv('AWS_S3_BUCKET_NAME')


        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_region
        )

        s3_key = f"videos/{uuid.uuid4().hex}_{video_file}"
        try:
            s3_client.upload_file(
                video_path,
                bucket_name,
                s3_key,
                ExtraArgs={"ContentType": "video/mp4"}
            )
            s3_url = f"https://{bucket_name}.s3.amazonaws.com/{s3_key}"
        except ClientError as e:
            error_message = f"Failed to upload to S3: {str(e)}"
            print(error_message)
            return JSONResponse({"error": error_message}, status_code=500)


        return {"videoUrl": s3_url}

    except subprocess.TimeoutExpired:
        return JSONResponse({"error": "Manim execution timed out"}, status_code=408)
    except FileNotFoundError as e:
        # This is likely due to Manim not being installed or not in PATH
        error_message = f"Manim not found: {str(e)}"
        print(error_message)
        return JSONResponse({
            "error": error_message,
            "solution": "Make sure Manim is installed and in the system PATH. Run 'pip install manim' and ensure ffmpeg is installed."
        }, status_code=500)
    except Exception as e:
        error_message = f"Unexpected error: {str(e)}"
        print(error_message)
        # Print more detailed error information for debugging
        import traceback
        traceback.print_exc()
        return JSONResponse({"error": error_message}, status_code=500)
    finally:

        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        if video_path and os.path.exists(video_path):
            os.remove(video_path)