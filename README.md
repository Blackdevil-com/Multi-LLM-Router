# 🔀 Multi-LLM Router

A full-stack AI routing application that lets users direct prompts to the most suitable LLM provider based on task type. Instead of being locked into a single model, users select a task category and the request is routed to the appropriate provider — **Groq**, **Cloudflare Workers AI**, or **Hugging Face** — each serving specialized models for different capabilities.

---

## ✨ Features

- **Task-based routing** — Users select a task type and the prompt is dispatched to the right provider and model automatically
- **Multi-modal support** — Handles text, code, image generation, audio, speech, and vision tasks
- **Multi-provider backend** — Integrates Groq, Cloudflare Workers AI, and Hugging Face under a single API
- **Model visibility** — Frontend displays available models and their mapped task types
- **Clean chat UI** — Simple prompt screen for submitting queries and viewing responses

---

## 🗂️ Project Structure

```
Multi-LLM-Router/
├── backend/          # FastAPI server — routing logic & provider integrations
├── frontend/         # JavaScript UI — prompt screen & model/task selector
└── .claude/          # Claude project config
```

---

## 🧠 Routing Logic

The user selects a **task type** from the available list. Based on the selection, the backend routes the request to the appropriate provider and model:

| Task | Provider | Model |
|---|---|---|
| `code` | Groq | `qwen/qwen3-32b` |
| `debug` | Groq | `qwen/qwen3-32b` |
| `sql` | Groq | `qwen/qwen3-32b` |
| `explain` | Groq | `openai/gpt-oss-120b` |
| `summarize` | Groq | `openai/gpt-oss-120b` |
| `math` | Groq | `qwen/qwen3-32b` |
| `calculate` | Groq | `qwen/qwen3-32b` |
| `generate image` | Cloudflare Workers AI | `@cf/black-forest-labs/flux-1-schnell` |
| `draw` | Cloudflare Workers AI | `@cf/black-forest-labs/flux-1-schnell` |
| `transcribe` | Cloudflare Workers AI / Hugging Face | Speech-to-text model |
| `speech` | Cloudflare Workers AI | `@cf/deepgram/aura-2-en` |
| `text_to_speech` | Cloudflare Workers AI | `@cf/deepgram/aura-2-en` |
| `segment` | Hugging Face | Segmentation model |
| `describe` | Hugging Face | Vision/caption model |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| Frontend | JavaScript, HTML, CSS |
| LLM Providers | Groq, Cloudflare Workers AI, Hugging Face |
| Text Models | `qwen/qwen3-32b`, `openai/gpt-oss-120b` |
| Image Generation | `@cf/black-forest-labs/flux-1-schnell` |
| Text-to-Speech | `@cf/deepgram/aura-2-en` |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js (for frontend)
- API keys for:
  - [Groq](https://console.groq.com/)
  - [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
  - [Hugging Face](https://huggingface.co/settings/tokens)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

Start the backend server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:3000` and connects to the backend at `http://localhost:8000`.

---

## 📡 API Reference

### `GET /available_tasks`

Returns the list of supported task types and available models.

```json
{
  "available_tasks": [
    "code", "debug", "sql", "explain", "summarize",
    "math", "calculate", "generate image", "draw",
    "transcribe", "speech", "text_to_speech", "segment", "describe"
  ]
}
```

### `POST /chat`

Sends a prompt to the appropriate provider based on the task type.

**Request body:**
```json
{
  "task": "code",
  "prompt": "Write a binary search function in Python"
}
```

**Response:**
```json
{
  "model": "qwen/qwen3-32b",
  "provider": "groq",
  "response": "..."
}
```

---

## 📌 Notes

- Image generation tasks (`generate image`, `draw`) return binary image data via Cloudflare's Flux model.
- Audio tasks (`speech`, `text_to_speech`) use Cloudflare's Deepgram Aura model and return audio output.
- The frontend's model panel reflects the backend's available task-to-model mappings dynamically.

---

## 📄 License

This project is open source. Feel free to use, modify, and distribute it.
