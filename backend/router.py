ROUTING_RULES = {
    # Groq — LLMs (free, 24/7, fastest)
    "code":      "groq_coder",       # qwen-qwq-32b
    "debug":     "groq_coder",
    "sql":       "groq_coder",
    "explain":   "groq_explainer",   # llama-3.3-70b
    "summarize": "groq_explainer",
    "math":      "groq_math",        # deepseek-r1-distill
    "calculate": "groq_math",

    # Cloudflare — Media (free, 24/7, edge)
    "generate image": "cf_image",    # flux-1-schnell
    "draw":           "cf_image",
    "transcribe":     "cf_whisper",  # whisper-large-v3
    "speech":         "cf_whisper",
    "text_to_speech": "cf_tts",

    # Hugging Face — Vision (free serverless)
    "segment":   "hf_sam2",
    "describe":  "hf_phi4",
}