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

    async def generate(self, prompt: str) -> str:
        response = await self.client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024
        )
        return response.choices[0].message.content