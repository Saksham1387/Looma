from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Literal
from enum import Enum
import json

class TaskStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ManimCode(BaseModel):
    code: str
    scene_name: Optional[str] = None
    webhook_url: Optional[str] = None # Optional
    prompt_id:str


class TaskResponse(BaseModel):
    task_id: str
    status: TaskStatus = TaskStatus.PENDING


class TaskStatusResponse(BaseModel):
    task_id: str
    status: TaskStatus
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class RenderResult(BaseModel):
    video_url: str


class Task(BaseModel):
    """Represents a task for the queue system"""
    id: str
    code: str
    prompt_id:str
    scene_name: Optional[str] = None
    webhook_url: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

    def to_json(self) -> str:
        """Convert task to JSON string"""
        return json.dumps(self.dict())
    
    @classmethod
    def from_json(cls, json_str: str) -> 'Task':
        """Create task from JSON string"""
        data = json.loads(json_str)
        return cls(**data)