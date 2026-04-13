# Fix HF Vision Provider 410 Error

Approved Plan Implementation:

1. [x] Read backend/requirements.txt to check huggingface_hub
2. [x] Update hf_vision.py: model -> Qwen/Qwen2-VL-2B-Instruct, use AsyncInferenceClient
3. [x] Update requirements.txt if needed
4. [x] pip install -r requirements.txt
5. [ ] Test vision provider
6. [ ] Mark complete and remove this TODO

Status: Steps 1-4 complete. Dependencies installed. Ready for testing.
