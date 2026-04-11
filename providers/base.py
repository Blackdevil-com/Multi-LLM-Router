# providers/base.py
from abc import ABC, abstractmethod


class BaseProvider(ABC):
    """Base class for all LLM providers."""

    @abstractmethod
    async def generate(self, prompt: str) -> str:
        """Generate a response from the provider.

        Args:
            prompt: The input prompt to generate a response for.

        Returns:
            The generated response as a string.
        """
        pass
