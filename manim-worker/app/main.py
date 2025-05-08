from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from contextlib import asynccontextmanager

from .models import ManimCode, TaskResponse, TaskStatusResponse
from .task_queue import queue
from .utils import validate_manim_code
from .config import FRONTEND_URL, TEMP_DIR


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for the FastAPI application."""
    os.makedirs(TEMP_DIR, exist_ok=True)
    yield
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/render", response_model=TaskResponse)
async def create_render_task(data: ManimCode):
    is_valid, error = validate_manim_code(data.code)
    if not is_valid:
        return JSONResponse({"error": error}, status_code=400)
    
    # Enqueue the task in Redis
    task_id = queue.enqueue_task(
        code=data.code,
        scene_name=data.scene_name,
        webhook_url=data.webhook_url
    )
    
    return TaskResponse(task_id=task_id)


@app.get("/api/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    task = queue.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return TaskStatusResponse(
        task_id=task.id,
        status=task.status,
        result=task.result,
        error=task.error
    )


@app.get("/health")
async def health_check():
    try:
        # Try to ping Redis
        if queue.redis.ping():
            return {"status": "ok", "redis": "connected"}
        return {"status": "degraded", "redis": "not responding"}
    except Exception as e:
        return {"status": "error", "redis": str(e)}