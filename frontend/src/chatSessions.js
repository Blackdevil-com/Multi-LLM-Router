export const initialChatSessions = [
  {
    id: 'welcome',
    title: 'Welcome Chat',
    task: '',
    messages: [],
    created: new Date().toISOString()
  }
];

export const generateSessionTitle = (messages, task) => {
  if (messages.length === 0) return `New Chat - ${task || 'General'}`;
  const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'Chat';
  return `${firstUserMsg.substring(0, 30)}${firstUserMsg.length > 30 ? '...' : ''} - ${task}`;
};

export const saveChatSessions = (sessions) => {
  localStorage.setItem('ai-router-chat-sessions', JSON.stringify(sessions));
};

export const loadChatSessions = () => {
  try {
    const saved = localStorage.getItem('ai-router-chat-sessions');
    if (!saved) return initialChatSessions;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(s => ({
      ...s, 
      title: s.title || generateSessionTitle(s.messages || [], s.task || '')
    })) : initialChatSessions;
  } catch (e) {
    console.error('Corrupted sessions, clearing:', e);
    localStorage.removeItem('ai-router-chat-sessions');
    return initialChatSessions;
  }
};

export const createNewSession = (currentTask = '') => ({
  id: Date.now().toString(),
  title: `New Chat - ${currentTask || 'General'}`,
  task: currentTask,
  messages: [],
  created: new Date().toISOString()
});
