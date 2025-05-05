
# 🎞️ Manim Worker with FastAPI

This folder contains a **worker service** that runs the [Manim](https://docs.manim.community/) animation engine and exposes a **FastAPI** server to render videos from code snippets. It processes incoming animation code, compiles it using Manim, and returns a **public URL** to access the resulting video.

## 🚀 Features

* 🧠 Accepts Python animation code via HTTP endpoint
* 🎬 Renders video using the Manim library
* 🌐 Hosts a FastAPI server
* 📤 Responds with a URL to the generated video

## 📦 Folder Purpose

This is part of a larger repository and is intended to run as a **worker service**. It's designed to be run independently and can be deployed as a background task handler or microservice.

## 📥 API Usage

### `POST /run-manim`

**Description**: Accepts a Manim animation script and returns a URL to the rendered video.

**Request Body**:

```json
{
  "code": "<your manim animation class code>"
}
```

**Response**:

```json
{
  "url": "https://your-domain.com/videos/<video_file>.mp4"
}
```

## ⚙️ Environment Variables

Create a `.env` file in the root with the following:

```env

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=

```

## 🛠️ Setup
1. **Install Manim Library**

   ```bash
   pip install manimgl
   ```

2. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Run the FastAPI Server**

   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## 📁 Output

Rendered videos are stored in the `videos/` directory (or a specified output path) and made publicly accessible via a static route.

## 📄 Example Manim Code

```python
from manim import *

class HelloWorld(Scene):
    def construct(self):
        text = Text("Hello, Manim!")
        self.play(Write(text))
        self.wait(1)
```

## 📌 Notes

* Ensure the `code` sent to the endpoint defines a valid Manim scene class.
* This service assumes access to a writable directory for rendering and serving video files.

## 🧪 Testing

You can test locally with tools like `curl`, Postman, or a Python client:

```bash
curl -X POST http://localhost:8000/run-manim \
     -H "Content-Type: application/json" \
     -d '{"code": "from manim import *\nclass Test(Scene):\n  def construct(self): self.play(Write(Text(\"Hello\")))"}'
```
