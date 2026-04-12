import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE = '/api'

const TASK_CATEGORIES = {
  'Code & Debugging': ['code', 'debug', 'sql'],
  'Explanation & Writing': ['explain', 'summarize'],
  'Math & Reasoning': ['math', 'calculate'],
  'Image Generation': ['generate image', 'draw'],
'Audio & Transcription': ['transcribe', 'speech', 'text_to_speech'],
  'Vision & Analysis': ['segment', 'describe']
}

const PROVIDER_INFO = {
cf_tts: { name: 'Cloudflare TTS', model: 'deepgram/aura-2-en', color: '#ec4899' },
  groq_coder: { name: 'Groq Coder', model: 'Qwen3-32B', color: '#10b981' },
  groq_explainer: { name: 'Groq Explainer', model: 'Llama-3.3-70B', color: '#3b82f6' },
  groq_math: { name: 'Groq Math', model: 'GPT-oss-120B', color: '#f59e0b' },
  cf_image: { name: 'Cloudflare Image', model: 'Flux-1 Schnell', color: '#8b5cf6' },
  cf_whisper: { name: 'Cloudflare Whisper', model: 'Whisper Large v3', color: '#ec4899' },
  hf_sam2: { name: 'HuggingFace SAM2', model: 'facebook/sam2-hiera-large', color: '#06b6d4' },
  hf_phi4: { name: 'HuggingFace Phi-4', model: 'microsoft/phi-4', color: '#84cc16' }
}

function App() {
  const [availableTasks, setAvailableTasks] = useState([])
  const [providers, setProviders] = useState({})
  const [routingRules, setRoutingRules] = useState({})
  const [selectedTask, setSelectedTask] = useState('')
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imageResponse, setImageResponse] = useState(null)
  const [audioResponse, setAudioResponse] = useState(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [rootRes, providersRes] = await Promise.all([
        axios.get(`${API_BASE}/`),
        axios.get(`${API_BASE}/providers`)
      ])
      setAvailableTasks(rootRes.data.available_tasks || [])
      setProviders(providersRes.data.providers || [])
      setRoutingRules(providersRes.data.routing_rules || {})
    } catch (err) {
      setError('Failed to connect to backend. Make sure the server is running on port 8000.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedTask || !prompt.trim()) return

    setLoading(true)
    setError(null)
    setResponse(null)
      setImageResponse(null)
      setAudioResponse(null)

    try {
      const res = await axios.post(`${API_BASE}/generate`, {
        task_type: selectedTask,
        prompt: prompt
      }, {
responseType: (selectedTask.includes('image') || selectedTask === 'draw' || selectedTask === 'text_to_speech') ? 'blob' : 'json'
      })

if (selectedTask.includes('image') || selectedTask === 'draw' || selectedTask === 'text_to_speech') {
      const mediaUrl = URL.createObjectURL(res.data)
if (selectedTask === 'text_to_speech') {
        setAudioResponse(mediaUrl)
      } else {
        setImageResponse(mediaUrl)
      }
      } else {
        setResponse({
          provider: res.data.provider,
          content: res.data.response
        })
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate response')
    } finally {
      setLoading(false)
    }
  }

  const getProviderForTask = (task) => {
    return routingRules[task] || null
  }

  const getProviderInfo = (providerKey) => {
    return PROVIDER_INFO[providerKey] || { name: providerKey, model: 'Unknown', color: '#6b7280' }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <svg className="logo-icon" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="var(--accent)" strokeWidth="3" fill="none"/>
            <circle cx="24" cy="24" r="8" stroke="var(--accent)" strokeWidth="2" fill="none"/>
            <circle cx="24" cy="24" r="3" fill="var(--accent)"/>
          </svg>
          <h1>AI Multi LLM Router</h1>
        </div>
        <p className="subtitle">Intelligent routing to free LLM providers based on task type</p>
      </header>

      <main className="main">
        <section className="card providers-section">
          <h2>Available Providers</h2>
          <div className="providers-grid">
            {Object.entries(routingRules).map(([task, providerKey]) => {
              const info = getProviderInfo(providerKey)
              return (
                <div
                  key={task}
                  className="provider-card"
                  style={{ borderColor: info.color }}
                >
                  <div className="provider-header">
                    <span className="provider-dot" style={{ backgroundColor: info.color }}/>
                    <span className="provider-name">{info.name}</span>
                  </div>
                  <p className="provider-model">{info.model}</p>
                  <p className="provider-tasks">Tasks: <code>{task}</code></p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="card form-section">
          <h2>Send a Request</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="task-type">Task Type</label>
              <select
                id="task-type"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                required
              >
                <option value="">Select a task type...</option>
                {Object.entries(TASK_CATEGORIES).map(([category, tasks]) => (
                  <optgroup key={category} label={category}>
                    {tasks.map(task => (
                      <option key={task} value={task}>
                        {task} {routingRules[task] && `→ ${getProviderInfo(routingRules[task]).name}`}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {selectedTask && routingRules[selectedTask] && (
                <p className="selected-provider">
                  Will route to: <strong style={{ color: getProviderInfo(routingRules[selectedTask]).color }}>
                    {getProviderInfo(routingRules[selectedTask]).name}
                  </strong> ({getProviderInfo(routingRules[selectedTask]).model})
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="prompt">Prompt</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                rows={6}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading || !selectedTask || !prompt.trim()}>
              {loading ? (
                <>
                  <span className="spinner"/>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                  Generate Response
                </>
              )}
            </button>
          </form>
        </section>

        {error && (
          <section className="card error-section">
            <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <p>{error}</p>
          </section>
        )}

        {loading && (
          <section className="card loading-section">
            <div className="loading-animation">
              <div className="pulse"/>
              <p>Routing to provider and generating response...</p>
            </div>
          </section>
        )}

        {response && (
          <section className="card response-section">
            <h2>Response</h2>
            <div className="response-meta">
              <span className="provider-badge" style={{ backgroundColor: getProviderInfo(response.provider).color }}>
                {getProviderInfo(response.provider).name}
              </span>
              <span className="model-info">{getProviderInfo(response.provider).model}</span>
            </div>
            <div className="response-content">
              <p>{response.content}</p>
            </div>
          </section>
        )}

{imageResponse && (
          <section className="card response-section image-section">
            <h2>Generated Image</h2>
            <div className="response-meta">
              <span className="provider-badge" style={{ backgroundColor: getProviderInfo(routingRules[selectedTask]).color }}>
                {getProviderInfo(routingRules[selectedTask]).name}
              </span>
            </div>
            <div className="image-container">
              <img src={imageResponse} alt="Generated result" />
              <a href={imageResponse} download="generated-image.jpg" className="download-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                Download Image
              </a>
            </div>
          </section>
        )}
        {audioResponse && (
          <section className="card response-section audio-section">
            <h2>Generated Audio</h2>
            <div className="response-meta">
              <span className="provider-badge" style={{ backgroundColor: getProviderInfo(routingRules[selectedTask]).color }}>
                {getProviderInfo(routingRules[selectedTask]).name}
              </span>
            </div>
            <div className="audio-container">
              <audio controls src={audioResponse} className="audio-player">
                Your browser does not support the audio element.
              </audio>
              <a href={audioResponse} download="generated-audio.mp3" className="download-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                Download Audio
              </a>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>AI Multi LLM Router v1.0.0 — Powered by Groq, Cloudflare Workers AI, and HuggingFace</p>
      </footer>
    </div>
  )
}

export default App
