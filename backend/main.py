import base64
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Response, Form, File, UploadFile
from pydantic import BaseModel

from router import ROUTING_RULES
from registry import PROVIDER_REGISTRY

# Load environment variables
load_dotenv()


class QueryRequest(BaseModel):
    task_type: str
    prompt: str


class QueryResponse(BaseModel):
    provider: str
    response: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events."""
    print("Starting AI Multi LLM Router...")
    yield
    print("Shutting down...")


app = FastAPI(
    title="AI Multi LLM Router",
    description="Intelligent routing to free LLM providers based on task type",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/")
async def root():
    return {
        "message": "AI Multi LLM Router",
        "available_tasks": list(ROUTING_RULES.keys())
    }


@app.get("/providers")
async def list_providers():
    """List all available providers."""
    return {
        "providers": list(PROVIDER_REGISTRY.keys()),
        "routing_rules": ROUTING_RULES
    }


@app.post("/generate")
async def generate(
  task_type: str = Form(...),
  prompt: str = Form(""),
  image: UploadFile = File(None)
):
    provider_key = None
    for task, provider in ROUTING_RULES.items():
        if task.lower() == task_type.lower():
            provider_key = provider
            break

    if not provider_key:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown task type: {task_type}"
        )

    provider = PROVIDER_REGISTRY.get(provider_key)

    image_b64 = None
    if image and task_type.lower() in ['segment', 'describe']:
        contents = await image.read()
        image_b64 = base64.b64encode(contents).decode()
        await image.close()

    try:
        # Pass image_b64 if vision task
        response = await provider.generate(prompt, image_b64=image_b64)

        # If image provider, return real image
        if provider_key == "cf_image":
            image_bytes = base64.b64decode(response)
            return Response(content=image_bytes, media_type="image/jpeg")
        
        # TTS output
        if provider_key == "cf_tts":
            return Response(content=response, media_type="audio/wav")

        return {
            "provider": provider_key,
            "response": response
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Provider error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
