from redis import Redis
from .config import (
    REDIS_HOST, 
    REDIS_PORT, 
    REDIS_DB, 
    REDIS_PASSWORD,
    TASK_QUEUE,
    RESULT_HASH,
    TASK_CHANNEL
)
from typing import Optional , Dict,Any
import uuid
from .models import Task,TaskStatus
import json 

class RedisQueue:
    def __init__(self):
        self.redis = Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
            password=REDIS_PASSWORD,
            decode_responses=True
        )
        
    def enqueue_task(self,code:str,prompt_id:str,scene_name:Optional[str] = None,webhook_url:Optional[str] = None) -> str:
        task_id = str(uuid.uuid4())
        
        task = Task(
                id=task_id,
                code = code,
                prompt_id=prompt_id,
                scene_name= scene_name,
                webhook_url=webhook_url,
                status= TaskStatus.PENDING
            )
        
        self.redis.hset(RESULT_HASH,task_id,task.to_json())
        self.redis.lpush(TASK_QUEUE,task_id)
        
        self.redis.publish(TASK_CHANNEL, json.dumps({
            "type": "task_added",
            "task_id": task_id
        }))
        
        return task_id
    
    
    def get_task(self,task_id:str) -> Optional[Task]:
        task_json = self.redis.hget(RESULT_HASH,task_id)
        
        if task_id:
            return Task.from_json(task_json)
        
        return None
        
    def get_next_task(self) -> Optional[Task]:
        task_id = self.redis.rpop(TASK_QUEUE)
        if task_id:
            task_json = self.redis.hget(RESULT_HASH,task_id)
            if task_json:
                return Task.from_json(task_json)
        return None
    
    def wait_for_task(self,timeout: int = 0) -> Optional[Task]:
        result = self.redis.brpop(TASK_QUEUE,timeout)
        if result:
            _,task_id = result
            task_json = self.redis.hget(RESULT_HASH, task_id)
            if task_json:
                return Task.from_json(task_json)
        return None
    
    def update_task_status(self, task_id: str, status: TaskStatus, 
                           result: Optional[Dict[str, Any]] = None, 
                           error: Optional[str] = None) -> bool:
        
        task_json = self.redis.hget(RESULT_HASH, task_id)
        if not task_json:
            return False
        
        task = Task.from_json(task_json)
        task.status = status
        
        if result is not None:
            task.result = result
        
        if error is not None:
            task.error = error
        
        self.redis.hset(RESULT_HASH, task_id, task.to_json())
        
        self.redis.publish(TASK_CHANNEL, json.dumps({
            "type": "status_update",
            "task_id": task_id,
            "status": status
        }))
        
        return True
    
    def clean_old_tasks(self, max_tasks: int = 1000) -> int:
        task_ids = self.redis.hkeys(RESULT_HASH)
        
        if len(task_ids) <= max_tasks:
            return 0
        
        to_remove = len(task_ids) - max_tasks

        for i in range(to_remove):
            if i < len(task_ids):
                self.redis.hdel(RESULT_HASH, task_ids[i])
        
        return to_remove
    
    
queue = RedisQueue()
