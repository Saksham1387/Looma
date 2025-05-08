import argparse
import os
import time
import logging
import asyncio
from app.worker import start_workers
from app.config import NUM_WORKERS

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def main():
    parser = argparse.ArgumentParser(description="Manim rendering worker")
    parser.add_argument("--workers", type=int, default=NUM_WORKERS,
                        help="Number of worker threads to start")
    args = parser.parse_args()
    
    os.makedirs("temp", exist_ok=True)
    
    # Properly await the async function
    await start_workers(args.workers)
    
    try:
        logger.info("Workers started, press Ctrl+C to stop")
        while True:
            # Use asyncio.sleep instead of time.sleep in async functions
            await asyncio.sleep(60)
    except KeyboardInterrupt:
        logger.info("Shutting down workers...")

if __name__ == "__main__":
    # Run the async main function through the event loop
    asyncio.run(main())