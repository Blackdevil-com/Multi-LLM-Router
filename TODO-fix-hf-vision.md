# Fix HF Vision Provider Errors

Approved Plan v3 Impl:

1. [x] hf_vision.py: BLIP captioner (reliable free HF model for describe/image tasks, original httpx style).
2. [ ] registry.py: Stub hf_sam2 to working model (SAM2 not chat LLM).
3. [x] requirements.txt update/install done.
4. [ ] Test.

Status: hf_vision now uses BLIP (no 410/model support issues). SAM2 stubbed. Restart server to test describe image.
