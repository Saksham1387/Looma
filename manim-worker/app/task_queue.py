# from redis import Redis
# from .config import (
#     REDIS_HOST, 
#     REDIS_PORT, 
#     REDIS_DB, 
#     REDIS_PASSWORD,
#     TASK_CHANNEL
# )
# from typing import Optional, Dict, Any
# import uuid
# from .models import Task, TaskStatus
# import json

# class CeleryRedisQueue:
#     def __init__(self):
#         self.redis = Redis(
#             host=REDIS_HOST,
#             port=REDIS_PORT,
#             db=REDIS_DB,
#             password=REDIS_PASSWORD,
#             decode_responses=True
#         )
        
#     def enqueue_task(self, code: str, prompt_id: str, scene_name: Optional[str] = None, webhook_url: Optional[str] = None) -> str:
#         """Enqueue a task for Celery processing and store task info in Redis"""
#         task_id = str(uuid.uuid4())
        
#         # Store initial task data in Redis
#         task = Task(
#             id=task_id,
#             code=code,
#             prompt_id=prompt_id,
#             scene_name=scene_name,
#             webhook_url=webhook_url,
#             status=TaskStatus.PENDING
#         )
        
#         # Store task data in Redis
#         self.redis.hset(f"task:{task_id}", mapping={
#             "code": code,
#             "prompt_id": prompt_id,
#             "scene_name": scene_name if scene_name else "",
#             "webhook_url": webhook_url if webhook_url else "",
#             "status": TaskStatus.PENDING
#         })
        
#         # Publish that a new task was added
#         self.redis.publish(TASK_CHANNEL, json.dumps({
#             "type": "task_added",
#             "task_id": task_id
#         }))
        
#         # Import Celery task only when needed to avoid circular import
#         from .worker import process_manim_task
#         # Submit the task to Celery
#         process_manim_task.delay(task_id, code, prompt_id, scene_name, webhook_url)
        
#         return task_id
    
#     def get_task(self, task_id: str) -> Optional[Task]:
#         """Get task data from Redis"""
#         task_data = self.redis.hgetall(f"task:{task_id}")
        
#         if not task_data:
#             return None
        
#         # Process fields that might be JSON
#         result = None
#         if "result" in task_data:
#             try:
#                 result = json.loads(task_data["result"])
#             except json.JSONDecodeError:
#                 result = task_data["result"]
        
#         # Convert back to Task model
#         return Task(
#             id=task_id,
#             code=task_data.get("code", ""),
#             prompt_id=task_data.get("prompt_id", ""),
#             scene_name=task_data.get("scene_name", ""),
#             webhook_url=task_data.get("webhook_url", ""),
#             status=task_data.get("status", TaskStatus.PENDING),
#             result=result,
#             error=task_data.get("error")
#         )
    
#     def update_task_status(self, task_id: str, status: str, 
#                           result: Optional[Dict[str, Any]] = None, 
#                           error: Optional[str] = None) -> bool:
#         """Update task status in Redis"""
#         if not self.redis.exists(f"task:{task_id}"):
#             return False
        
#         update_data = {"status": status}
        
#         if result is not None:
#             update_data["result"] = json.dumps(result)
        
#         if error is not None:
#             update_data["error"] = error
        
#         self.redis.hset(f"task:{task_id}", mapping=update_data)
        
#         # Also publish an update message
#         self.redis.publish(TASK_CHANNEL, json.dumps({
#             "type": "status_update",
#             "task_id": task_id,
#             "status": status
#         }))
        
#         return True
    
#     def clean_old_tasks(self, max_tasks: int = 1000) -> int:
#         """Clean up old tasks from Redis"""
#         # Get all task keys
#         task_keys = self.redis.keys("task:*")
        
#         if len(task_keys) <= max_tasks:
#             return 0
        
#         # Sort by creation time if available or just take the first ones
#         to_remove = len(task_keys) - max_tasks
#         keys_to_remove = task_keys[:to_remove]
        
#         removed = 0
#         for key in keys_to_remove:
#             self.redis.delete(key)
#             removed += 1
        
#         return removed

# # Create a singleton instance
# queue = CeleryRedisQueue()



import redis
from .config import (
    REDIS_HOST, 
    REDIS_PORT, 
    REDIS_DB, 
    REDIS_PASSWORD,
    TASK_CHANNEL
)
from typing import Optional, Dict, Any
import uuid
from .models import Task, TaskStatus
import json

class CeleryRedisQueue:
    def __init__(self):
        self.redis = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
            password=REDIS_PASSWORD,
            decode_responses=True
        )
        
    def enqueue_task(self, code: str, prompt_id: str, scene_name: Optional[str] = None, webhook_url: Optional[str] = None) -> str:
        """Enqueue a task for Celery processing and store task info in Redis"""
        task_id = str(uuid.uuid4())
        
        # Store initial task data in Redis
        task = Task(
            id=task_id,
            code=code,
            prompt_id=prompt_id,
            scene_name=scene_name,
            webhook_url=webhook_url,
            status=TaskStatus.PENDING
        )
        
        # Store task data in Redis
        self.redis.hset(f"task:{task_id}", mapping={
            "code": code,
            "prompt_id": prompt_id,
            "scene_name": scene_name if scene_name else "",
            "webhook_url": webhook_url if webhook_url else "",
            "status": TaskStatus.PENDING
        })
        
        # Publish that a new task was added
        self.redis.publish(TASK_CHANNEL, json.dumps({
            "type": "task_added",
            "task_id": task_id
        }))
        
        # Import Celery task only when needed to avoid circular import
        from .worker import process_manim_task
        # Submit the task to Celery
        process_manim_task.delay(task_id, code, prompt_id, scene_name, webhook_url)
        
        return task_id
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """Get task data from Redis"""
        task_data = self.redis.hgetall(f"task:{task_id}")
        
        if not task_data:
            return None
        
        # Process fields that might be JSON
        result = None
        if "result" in task_data:
            try:
                result = json.loads(task_data["result"])
            except json.JSONDecodeError:
                result = task_data["result"]
        
        # Convert back to Task model
        return Task(
            id=task_id,
            code=task_data.get("code", ""),
            prompt_id=task_data.get("prompt_id", ""),
            scene_name=task_data.get("scene_name", ""),
            webhook_url=task_data.get("webhook_url", ""),
            status=task_data.get("status", TaskStatus.PENDING),
            result=result,
            error=task_data.get("error")
        )
    
    def update_task_status(self, task_id: str, status: str, 
                          result: Optional[Dict[str, Any]] = None, 
                          error: Optional[str] = None) -> bool:
        """Update task status in Redis"""
        if not self.redis.exists(f"task:{task_id}"):
            return False
        
        update_data = {"status": status}
        
        if result is not None:
            update_data["result"] = json.dumps(result)
        
        if error is not None:
            update_data["error"] = error
        
        self.redis.hset(f"task:{task_id}", mapping=update_data)
        
        # Also publish an update message
        self.redis.publish(TASK_CHANNEL, json.dumps({
            "type": "status_update",
            "task_id": task_id,
            "status": status
        }))
        
        return True
    
    def clean_old_tasks(self, max_tasks: int = 1000) -> int:
        """Clean up old tasks from Redis"""
        # Get all task keys
        task_keys = self.redis.keys("task:*")
        
        if len(task_keys) <= max_tasks:
            return 0
        
        # Sort by creation time if available or just take the first ones
        to_remove = len(task_keys) - max_tasks
        keys_to_remove = task_keys[:to_remove]
        
        removed = 0
        for key in keys_to_remove:
            self.redis.delete(key)
            removed += 1
        
        return removed

# Create a singleton instance
queue = CeleryRedisQueue()