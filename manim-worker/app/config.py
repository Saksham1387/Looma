import os
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)
REDIS_URL = f"redis://{':' + REDIS_PASSWORD + '@' if REDIS_PASSWORD else ''}{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"

TASK_QUEUE = "manim_tasks"
RESULT_HASH = "manim_results"
TASK_CHANNEL = "task_updates"

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
WEBHOOK_ENABLED = os.getenv("WEBHOOK_ENABLED", "false").lower() == "true"
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")

NUM_WORKERS = int(os.getenv("NUM_WORKERS", 2))

TEMP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "temp"))
MEDIA_DIR = "media"