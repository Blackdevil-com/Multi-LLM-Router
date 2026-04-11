# providers/cloudflare_image.py
import os, httpx
from .base import BaseProvider

class CloudflareImageProvider(BaseProvider):
    def __init__(self):
        self.account_id = os.getenv("CF_ACCOUNT_ID")
        self.api_token = os.getenv("CF_API_TOKEN")
        self.base_url = (
            f"https://api.cloudflare.com/client/v4/accounts/"
            f"{self.account_id}/ai/run"
        )

    async def generate(self, prompt: str) -> str:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{self.base_url}/@cf/black-forest-labs/flux-1-schnell",
                headers={"Authorization": f"Bearer {self.api_token}"},
                json={"prompt": prompt},
                timeout=60
            )

        data = r.json()

        if not data.get("success"):
            raise Exception(data["errors"])

        # image is returned as base64 string
        return data["result"]["image"]

class CloudflareWhisperProvider(BaseProvider):
    def __init__(self):
        self.account_id = os.getenv("CF_ACCOUNT_ID")
        self.api_token = os.getenv("CF_API_TOKEN")
        self.base_url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/ai/run"

    async def transcribe(self, audio_bytes: bytes) -> str:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{self.base_url}/@cf/openai/whisper",
                headers={"Authorization": f"Bearer {self.api_token}"},
                content=audio_bytes,
                timeout=60
            )
        return r.json()["result"]["text"]