import os
from openai import AsyncOpenAI
from .base import BaseProvider


class GroqMathProvider(BaseProvider):
    def __init__(self):
        self.client = AsyncOpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.model = "deepseek/deepseek-r1-distill-llama-70b"  # better math model

    async def generate(self, prompt: str, image_b64: str = None) -> str:
        messages = [{"role": "user", "content": prompt}]
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages
        )
        content = response.choices[0].message.content
        import re
        clean_content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL | re.IGNORECASE)
        return clean_content.strip()

