
![Collab Draw Banner](https://gold-legislative-tuna-190.mypinata.cloud/ipfs/bafybeicvxkdtg6srwve5igmi7vggitwfxprcl7l2x6xqabkv6vtoziimqq)

# Looma

**Looma** is a web application that lets you **generate stunning animations just by describing them in natural language**. Powered by [Manim](https://docs.manim.community/) under the hood, Looma translates your prompt into Python animation code, renders it using a backend worker, and delivers a playable video — all in one seamless flow.

Built with **Next.js**, **FastAPI**, and **OpenAI**, Looma is your creative canvas for math, science, and educational visualizations — no coding required.

---

## ✨ Features

* 🧠 **Prompt-to-Animation**: Describe your animation and get a rendered video
* 🎬 **Manim Integration**: Uses Manim to create mathematically accurate visuals
* ⚡ **FastAPI Worker**: A Python-based worker renders Manim code securely
* 🔐 **Google OAuth**: Authenticate via your Google account
* 🌐 **Next.js Frontend**: Smooth UI built with React and deployed via Next.js
* 🧰 **Monorepo with `pnpm`**: Frontend and worker live together in one project

---

## 🗂️ Project Structure

```
Looma/
├── src/                   # Next.js application (frontend)
├── worker/                # Manim worker service (FastAPI)
├── .env                   # Environment configuration
├── pnpm-workspace.yaml    # Monorepo workspace config
└── README.md              # You're reading it :)
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root with the following:

```env
# Database
DATABASE_URL=
DIRECT_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OpenAI API
OPENAI_API_KEY=

# Auth
NEXTAUTH_SECRET=secret

# Manim Worker URL
WORKER_URL="http://0.0.0.0:8000"
```

---

## 🧱 Tech Stack

* **Frontend**: Next.js 14, React, Tailwind CSS, NextAuth.js
* **Backend Worker**: FastAPI, Manim (Python)
* **Authentication**: Google OAuth
* **AI Integration**: OpenAI (GPT for prompt → code generation)
* **Package Manager**: `pnpm` (monorepo with workspace support)

---

## 🚀 Getting Started

### 1. Clone and install dependencies

```bash
git clone https://github.com/yourusername/looma.git
cd looma
pnpm install
```

### 2. Set up the environment

Create a `.env` file at the root using the example above.

### 3. Run the Manim worker

```bash
cd packages/worker
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Run the frontend

```bash
cd apps/web
pnpm dev
```

---

## 📤 How It Works

1. User logs in via Google
2. Enters a prompt like *“Show the Pythagorean theorem with colored triangles”*
3. Prompt is sent to OpenAI to generate Manim Python code
4. The code is sent to the FastAPI worker
5. Worker renders video with Manim and returns a public URL
6. Looma displays the video in the browser

---

## 🧪 Example Prompt

> "Animate the expansion of (a + b)² using colored areas and labels."

---

## 🛠️ Future Ideas

* User gallery and saved animations
* More animation styles and themes
* Real-time preview and scrubber
* Audio narration support

---

## 🧑‍💻 Contributing

Pull requests are welcome! Please open an issue first to discuss what you’d like to change.

---

## 🪄 License

MIT License. See [`LICENSE`](./LICENSE) for details.

---

Let me know if you want badges, deployment instructions (e.g., Vercel + Docker), or architecture diagrams!
