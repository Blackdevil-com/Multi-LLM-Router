# Fix Groq Coder Deprecation
- [x] Updated backend/providers/groq_coder.py: `llama3-groq-70b-8192-tool-use-preview` → `qwen-qwq-32b`
- [ ] Restart backend server: `cd backend && source ai-router-env/bin/activate && uvicorn main:app --reload`
- [ ] Test code request in frontend (e.g., "write python hello world")
- [ ] Verify no 400 model error
