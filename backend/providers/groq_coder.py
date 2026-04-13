import os
from openai import AsyncOpenAI
from .base import BaseProvider


class GroqCoderProvider(BaseProvider):
    def __init__(self):
        self.client = AsyncOpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.model = "qwen/qwen3-32b"  # best free coding model

    async def generate(self, prompt: str, image_b64: str = None) -> str:
        messages = [{"role": "user", "content": prompt}]
        if image_b64:
            messages[0]["content"] = [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
            ]
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages
        )
        content = response.choices[0].message.content
        import re
        clean_content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL | re.IGNORECASE)
        return clean_content.strip()


class GroqExplainerProvider(BaseProvider):
    def __init__(self):
        self.client = AsyncOpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.model = "llama-3.3-70b-versatile"

    async def generate(self, prompt: str, image_b64: str = None) -> str:
        messages = [{"role": "user", "content": prompt}]
        if image_b64:
            messages[0]["content"] = [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
            ]
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages
        )
        content = response.choices[0].message.content
        import re
        clean_content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL | re.IGNORECASE)
        return clean_content.strip()

