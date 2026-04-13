import os
import base64
from huggingface_hub import AsyncInferenceClient
from .base import BaseProvider


class HuggingFaceVisionProvider(BaseProvider):
    def __init__(self):
        self.model = "Qwen/Qwen2-VL-2B-Instruct"
        token = os.getenv("HF_TOKEN")
        self.client = AsyncInferenceClient(
            model=self.model,
            token=token
        )

    async def generate(self, prompt: str, image_b64: str = None) -> str:
        if not image_b64:
            return "No image provided for vision task."

        # Truncate for size ~1MB chars like hf_provider
        if len(image_b64) > 1_000_000:
            image_b64 = image_b64[:1_000_000]

        messages = [{"role": "user", "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
            {"type": "text", "text": prompt}
        ]}]
            
        response = await self.client.chat_completion(
            messages=messages,
            max_tokens=1024
        )
        return response.choices[0].message.content
