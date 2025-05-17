#!/bin/bash

# Make script directory the working directory
cd "$(dirname "$0")"

# Start Celery worker in the background
echo "Starting Celery worker..."
celery -A app.worker worker --loglevel=info --concurrency=2 &
CELERY_PID=$!

# Save PID for later cleanup
echo $CELERY_PID > celery.pid

# Start FastAPI server
echo "Starting FastAPI server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 

# When the FastAPI server is stopped, also stop the Celery worker
kill $(cat celery.pid)
rm celery.pid