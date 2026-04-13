import os
from openai import AsyncOpenAI
from .base import BaseProvider
import re

class GroqCoderProvider(BaseProvider):
    def __init__(self):
        self.client = AsyncOpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.model = "qwen/qwen3-32b"  # Good for code (Qwen)

    async def generate(self, prompt: str, image_b64: str = None) -> str:
        # Vision models only
        if image_b64:
            if not prompt:
                prompt = "Describe this image in detail."
            messages = [{"role": "user", "content": prompt}]  # Text-only fallback
        else:
            messages = [{"role": "user", "content": prompt}]
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages
        )
        content = response.choices[0].message.content
        clean_content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL | re.IGNORECASE)
        if image_b64:
            clean_content += "\n\n*(Image uploaded but used text description mode - set up HF/Groq vision model for multimodal)*"
        return clean_content.strip()


class GroqExplainerProvider(BaseProvider):
    def __init__(self):
        self.client = AsyncOpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.model = "llama-3.1-8b-instant"  # Reliable text (fixed invalid model)

    async def generate(self, prompt: str, image_b64: str = None) -> str:
        # Text-only
        messages = [{"role": "user", "content": prompt}]
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages
        )
        content = response.choices[0].message.content
        clean_content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL | re.IGNORECASE)
        if image_b64:
            clean_content += "\n\n*(Image detected. Text analysis used. Vision ready for setup.)*"
        return clean_content.strip()

