import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'
import { loadChatSessions, saveChatSessions, generateSessionTitle, createNewSession } from './chatSessions.js'

const API_BASE = '/api'

const TASK_CATEGORIES = {
  'Code': ['code', 'debug', 'sql'],
  'Writing': ['explain', 'summarize'],
  'Math': ['math', 'calculate'],
  'Image': ['generate image', 'draw'],
  'Audio': ['transcribe', 'speech', 'text_to_speech'],
  'Vision': ['segment', 'describe']
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
  const [routingRules, setRoutingRules] = useState({})
  const [backendStatus, setBackendStatus] = useState('disconnected')
  const fallbackRules = {
    "code": "groq_coder",
    "explain": "groq_explainer",
    "math": "groq_math",
    "generate image": "cf_image",
    "transcribe": "cf_whisper",
    "text_to_speech": "cf_tts",
    "segment": "hf_sam2",
    "describe": "hf_phi4"
  }
  const [chatSessions, setChatSessions] = useState(loadChatSessions())
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [currentTask, setCurrentTask] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [apiKeys, setApiKeys] = useState({
    GROQ_API_KEY: '',
    CF_ACCOUNT_ID: '',
    CF_API_TOKEN: '',
    HF_TOKEN: ''
  })
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetchProviders()
    loadApiKeys()
    const savedTask = localStorage.getItem('ai-router-current-task')
    if (savedTask) setCurrentTask(savedTask)
    const initialSessions = loadChatSessions()
    if (initialSessions.length > 0) {
      setActiveSessionId(initialSessions[0].id)
      setMessages(initialSessions[0].messages || [])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('ai-router-current-task', currentTask)
  }, [currentTask])

  useEffect(() => {
    if (activeSessionId) {
      const session = chatSessions.find(s => s.id === activeSessionId)
      if (session) {
        setMessages(session.messages || [])
        setCurrentTask(session.task || '')
      }
    }
  }, [activeSessionId])

  useEffect(() => {
    if (activeSessionId) {
      setChatSessions(prev => {
        const updated = prev.map(s => 
          s.id === activeSessionId 
            ? { ...s, messages, task: currentTask, updated: new Date().toISOString() }
            : s
        )
        saveChatSessions(updated)
        return updated
      })
    }
  }, [messages, currentTask, activeSessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchProviders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/providers`)
      setRoutingRules(res.data.routing_rules || {})
      setBackendStatus('connected')
    } catch (err) {
      console.error('Failed to fetch providers:', err)
      setBackendStatus('disconnected')
      setRoutingRules(fallbackRules)
    }
  }

  const loadApiKeys = () => {
    try {
      const saved = localStorage.getItem('ai-router-keys')
      if (saved) {
        setApiKeys(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Invalid API keys', e)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!prompt.trim() || !currentTask) return

    const userMessage = { role: 'user', content: prompt, task_type: currentTask, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    const currentPrompt = prompt

    try {
      let responseType = (currentTask === 'text_to_speech' || currentTask.includes('image') || currentTask === 'draw') ? 'blob' : 'json'
      const res = await axios.post(`${API_BASE}/generate`, {
        task_type: currentTask,
        prompt: buildPromptWithHistory(currentPrompt)
      }, { responseType })

      let aiContent
      if (responseType === 'blob') {
        const url = URL.createObjectURL(res.data)
        aiContent = { type: currentTask === 'text_to_speech' ? 'audio' : 'image', url, provider: routingRules[currentTask] }
      } else {
        aiContent = { type: 'text', text: res.data.response, provider: res.data.provider }
      }

      const aiMessage = { role: 'ai', content: aiContent, timestamp: new Date() }
      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      const errorMessage = { role: 'ai', content: { type: 'error', text: err.response?.data?.detail || err.message }, timestamp: new Date() }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      setPrompt('')
      inputRef.current?.focus()
    }
  }

  const buildPromptWithHistory = (input) => {
    if (messages.length === 0) return input
    const history = messages.slice(-4).map(m => `${m.role.toUpperCase()}: ${typeof m.content === 'string' ? m.content : '[media]'}`).join('\n')
    return `Previous conversation:\n${history}\n\nNew query: ${input}`
  }

  const getProviderInfo = (providerKey) => PROVIDER_INFO[providerKey] || { name: providerKey, model: 'Unknown', color: '#6b7280' }

  const clearChat = () => {
    setMessages([])
  }

  const handleNewChat = () => {
    const newSession = createNewSession(currentTask)
    setChatSessions(prev => {
      const updatedCurrent = prev.map(s => 
        s.id === activeSessionId ? { ...s, messages, task: currentTask, updated: new Date().toISOString() } : s
      )
      return [...updatedCurrent, newSession]
    })
    setActiveSessionId(newSession.id)
    setMessages([])
    setPrompt('')
  }

  const deleteSession = (id) => {
    setChatSessions(prev => {
      const updated = prev.filter(s => s.id !== id)
      saveChatSessions(updated)
      return updated
    })
    if (activeSessionId === id) {
      setMessages([])
      setCurrentTask('')
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id)
      }
    }
  }

  const exportChat = () => {
    const chatText = messages.map(m => `${m.role.toUpperCase()}: ${typeof m.content === 'object' ? '[media]' : m.content.text || m.content}`).join('\n\n')
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chat-history.txt'
    a.click()
  }

  return (
    <div className="chat-app">
      <header className="header">
        <div className="logo">
          <svg className="logo-icon" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="var(--accent)" strokeWidth="3" fill="none"/>
            <circle cx="24" cy="24" r="8" stroke="var(--accent)" strokeWidth="2" fill="none"/>
            <circle cx="24" cy="24" r="3" fill="var(--accent)"/>
          </svg>
          <h1>AI Router Chat</h1>
        </div>
        <p className="subtitle">Real-time chat with intelligent provider routing</p>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>Available Providers</h3>
            <div className="providers-container">
              <div className="providers-list">
                {backendStatus === 'disconnected' && (
                  <div className="backend-status">
                    <p>⚠️ Backend offline</p>
                    <p>Run: <code>cd backend &amp;&amp; python main.py</code></p>
                  </div>
                )}
                {Object.entries(routingRules).map(([task, provider]) => {
                  const info = getProviderInfo(provider)
                  return (
                    <div key={task} className="provider-item">
                      <span className="provider-dot" style={{backgroundColor: info.color}} />
                      <span>{info.name} <small>{task}</small></span>
                    </div>
                  )
                })}
              </div>
            </div>
            <p className="providers-note">Select task from dropdown</p>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-toggle" onClick={() => setSettingsOpen(!settingsOpen)}>
              <span>⚙️ Settings</span>
            </div>
            {settingsOpen && (
              <div className="settings-panel">
                <h4>API Keys (localStorage → backend .env)</h4>
                {Object.entries(apiKeys).map(([key, value]) => (
                  <div key={key} className="api-key-input">
                    <label>{key}</label>
                    <input 
                      type="password" 
                      value={value} 
                      onChange={(e) => setApiKeys({...apiKeys, [key]: e.target.value})}
                      placeholder={`Enter ${key}`}
                    />
                  </div>
                ))}
                <button className="save-keys-btn" onClick={() => {
                  localStorage.setItem('ai-router-keys', JSON.stringify(apiKeys))
                  alert('Keys saved! Copy to backend .env')
                }}>
                  Save Keys
                </button>
                <p className="note">Copy saved keys to backend .env file.</p>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <h3>History</h3>
            <div className="history-list">
              {chatSessions.map(session => (
                <div key={session.id} className={`history-item ${activeSessionId === session.id ? 'active' : ''}`} onClick={() => setActiveSessionId(session.id)}>
                  <span>{session.title || 'Untitled'}</span>
                  <button className="delete-btn" onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Delete session?')) {
                      setChatSessions(prev => {
                        const updated = prev.filter(s => s.id !== session.id)
                        saveChatSessions(updated)
                        return updated
                      })
                      if (activeSessionId === session.id) {
                        setMessages([])
                        setCurrentTask('')
                      }
                    }
                  }}>×</button>
                </div>
              ))}
            </div>
            <button className="new-chat-btn" onClick={handleNewChat}>+ New Chat</button>
          </div>
          <div className="sidebar-actions">
            <button className="clear-btn" onClick={clearChat}>Clear Current</button>
            <button className="export-btn" onClick={exportChat}>Export</button>
          </div>
        </aside>

        <main className="chat-main">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <h2>Welcome to AI Router Chat!</h2>
                <p>Select a task from dropdown, type message, Send → AI response!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-bubble">
                    {message.role === 'user' ? (
                      <div className="user-content">{message.content}</div>
                    ) : message.content.type === 'text' ? (
                      <div className="ai-text">
                        <div className="provider-tag" style={{backgroundColor: getProviderInfo(message.content.provider).color}}>
                          {getProviderInfo(message.content.provider).name}
                        </div>
                        <p>{message.content.text}</p>
                      </div>
                    ) : message.content.type === 'image' ? (
                      <div className="ai-media">
                        <img src={message.content.url} alt="Generated" />
                      </div>
                    ) : message.content.type === 'audio' ? (
                      <div className="ai-media">
                        <audio controls src={message.content.url} />
                      </div>
                    ) : (
                      <div className="error-content">{message.content.text}</div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="message ai">
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-bar">
            <select 
              value={currentTask} 
              onChange={(e) => setCurrentTask(e.target.value)}
              className="task-select"
            >
              <option value="">Select Task</option>
              {Object.keys(routingRules || fallbackRules).map(task => (
                <option key={task} value={task}>{task}</option>
              ))}
            </select>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Type your message... (Enter to send)"
              className="prompt-input"
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !prompt.trim() || !currentTask} className="send-btn">
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App

