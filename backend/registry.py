from providers.groq_coder import GroqCoderProvider, GroqExplainerProvider
from providers.cloudflare_image import CloudflareImageProvider, CloudflareWhisperProvider
from providers.hf_provider import HuggingFaceProvider
from providers.hf_vision import HuggingFaceVisionProvider
from providers.groq_math import GroqMathProvider
from providers.CloudflareTTSProvider import CloudflareTTSProvider

# Provider registry with lazy loading
_PROVIDER_REGISTRY = {
    "groq_coder": GroqCoderProvider,
    "groq_explainer": GroqExplainerProvider,
    "groq_math": GroqMathProvider,
    "cf_image": CloudflareImageProvider,
    "cf_whisper": CloudflareWhisperProvider,
    "hf_sam2": lambda: HuggingFaceProvider("facebook/sam2-hiera-large"),
    "hf_phi4": lambda: HuggingFaceVisionProvider(),
    "cf_tts": CloudflareTTSProvider,
}

# Cache for instantiated providers
_PROVIDER_INSTANCES = {}


def get_provider(provider_key: str):
    """Get a provider instance by key.

    Args:
        provider_key: The key of the provider to get.

    Returns:
        An instance of the provider.
    """
    if provider_key not in _PROVIDER_INSTANCES:
        provider_factory = _PROVIDER_REGISTRY[provider_key]
        _PROVIDER_INSTANCES[provider_key] = provider_factory()
    return _PROVIDER_INSTANCES[provider_key]


def list_providers():
    """List all available provider keys.

    Returns:
        A list of provider keys.
    """
    return list(_PROVIDER_REGISTRY.keys())


# For backwards compatibility, expose PROVIDER_REGISTRY as a dict-like proxy
class ProviderRegistryProxy:
    def __getitem__(self, key):
        return get_provider(key)

    def __contains__(self, key):
        return key in _PROVIDER_REGISTRY

    def get(self, key, default=None):
        if key in _PROVIDER_REGISTRY:
            return get_provider(key)
        return default

    def keys(self):
        return _PROVIDER_REGISTRY.keys()

    def values(self):
        return [get_provider(k) for k in _PROVIDER_REGISTRY.keys()]

    def items(self):
        return [(k, get_provider(k)) for k in _PROVIDER_REGISTRY.keys()]


PROVIDER_REGISTRY = ProviderRegistryProxy()
