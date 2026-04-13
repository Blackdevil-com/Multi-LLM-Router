# providers/base.py
from abc import ABC, abstractmethod


class BaseProvider(ABC):
    """Base class for all LLM providers."""

    @abstractmethod
    async def generate(self, prompt: str, image_b64: str = None) -> str:
        """Generate a response from the provider.

        Args:
            prompt: The input prompt to generate a response for.
            image_b64: Optional base64 encoded image for vision tasks.

        Returns:
            The generated response as a string.
        """
        pass
