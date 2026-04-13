import os
import httpx
from .base import BaseProvider

class HuggingFaceVisionProvider(BaseProvider):  # Cloudflare Phi-3-vision via hf_phi4 alias
    def __init__(self):
        self.account_id = os.getenv("CF_ACCOUNT_ID")
        self.api_token = os.getenv("CF_API_TOKEN")
        self.base_url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/ai/run/@cf/microsoft/phi-3-vision-128k-instruct"

    async def generate(self, prompt: str, image_b64: str = None) -> str:
        if not image_b64:
            return "No image provided for vision task."
        if not self.account_id or not self.api_token:
            return "Cloudflare credentials missing (CF_ACCOUNT_ID/CF_API_TOKEN)."

        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_b64}"
                        }
                    }
                ]
            }
        ]

        headers = {"Authorization": f"Bearer {self.api_token}"}
        payload = {"messages": messages, "max_tokens": 512}

        async with httpx.AsyncClient() as client:
            r = await client.post(self.base_url, headers=headers, json=payload, timeout=60)
            if not r.is_success:
                return f"CF Vision error: {r.text[:100]}"
            data = r.json()
            return data.get("result", {}).get("response", "No response")
