# providers/cloudflare_tts.py
import os
import httpx
from .base import BaseProvider


class CloudflareTTSProvider(BaseProvider):
    def __init__(self):
        self.account_id = os.getenv("CF_ACCOUNT_ID")
        self.api_token = os.getenv("CF_API_TOKEN")
        self.model = "@cf/deepgram/aura-2-en"

    async def generate(self, prompt: str) -> bytes:
        url = (
            f"https://api.cloudflare.com/client/v4/accounts/"
            f"{self.account_id}/ai/run/{self.model}"
        )

        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

        payload = {
            "text": prompt,
            "speaker": "luna",
            "encoding": "linear16",
            "container": "wav"
        }

        async with httpx.AsyncClient(timeout=90) as client:
            response = await client.post(
                url,
                headers=headers,
                json=payload
            )

            response.raise_for_status()
            return response.content