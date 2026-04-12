# Frontend TTS Update - COMPLETED

## Summary
- ✅ Added 'text_to_speech' / 'tts' task support in TASK_CATEGORIES
- ✅ Added cf_tts provider info ('deepgram/aura-2-en')
- ✅ Audio blob handling with HTML5 player + download
- ✅ Full chat UI refactor with provider sidebar, history, settings, fallback rules
- ✅ Backend integration ready (assumes /providers endpoint returns 'text_to_speech': 'cf_tts')

## Test Steps
1. Backend: `cd backend && source ai-router-env/bin/activate && python main.py`
2. Frontend: `cd frontend && npm run dev`
3. Select "text_to_speech" → enter prompt → Send → Play generated audio

**Progress**: 5/5 COMPLETE ✅
