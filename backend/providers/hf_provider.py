# providers/hf_provider.py
import os
from huggingface_hub import AsyncInferenceClient
from .base import BaseProvider

class HuggingFaceProvider(BaseProvider):
    def __init__(self, model: str):
        self.client = AsyncInferenceClient(
            model=model,
            token=os.getenv("HF_TOKEN")  # free at huggingface.co
        )
        self.model = model

    async def generate(self, prompt: str, image_b64: str = None) -> str:
        if image_b64:
            # Resize/resize for HF limits - take first 1MB
            import base64
            b64_bytes = image_b64.encode('utf-8')
            if len(b64_bytes) > 1_000_000:  # ~1MB
                image_b64 = image_b64[:1_000_000]
            
            messages = [{"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
                {"type": "text", "text": prompt}
            ]}]
        else:
            messages = [{"role": "user", "content": prompt}]
            
        response = await self.client.chat_completion(
            messages=messages,
            max_tokens=1024
        )
        return response.choices[0].message.content
