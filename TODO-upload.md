# File Upload Feature (Image → Vision Models)

**Status:** Planning

**Files analyzed:** App.jsx, router.py, hf_provider.py

**Vision Tasks:** 'segment' (hf_sam2), 'describe' (hf_phi4)

**High-level plan:**
1. Frontend: Add file input + preview in input-bar, send FormData to /api/generate
2. Backend: Update router.py /generate accept image file
3. hf_provider.py: Handle image input (base64 → model)
4. UI: Drag-drop + preview badge next to prompt

**Status:** Approved, implementing frontend first

**Steps:**
- [x] Analyze files
- [x] 1. Frontend App.jsx: Add image state/UI
- [x] 2. Frontend App.css: Upload styles
- [x] 3. Backend main.py: Update /generate for FormData  
- [x] 4. hf_provider.py: Image handling (base64)
- [x] 5. base.py: Signature update
- [x] Test end-to-end (frontend/backend ready)

