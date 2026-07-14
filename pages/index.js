import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('chat_username') || 'User' + Math.floor(Math.random() * 1000));
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Get the WebSocket URL (we need to connect to the same host)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/websocket`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // Send join message
      ws.send(JSON.stringify({ type: 'join', from: username }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'system') {
        setMessages(prev => [...prev, { type: 'system', text: data.text }]);
      } else {
        setMessages(prev => [...prev, data]);
      }
    };

    ws.onclose = () => {
      setMessages(prev => [...prev, { type: 'system', text: 'Disconnected — reconnecting...' }]);
      setTimeout(() => {
        // Reconnect logic (simplified)
      }, 3000);
    };

    return () => ws.close();
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { type: 'message', from: username, text: input };
    wsRef.current.send(JSON.stringify(msg));
    setInput('');
  };

  const changeUsername = () => {
    const newName = prompt('Enter new username:', username);
    if (newName && newName.trim()) {
      localStorage.setItem('chat_username', newName);
      setUsername(newName);
      // Send a leave and join to update others
      wsRef.current.send(JSON.stringify({ type: 'leave', from: username }));
      wsRef.current.send(JSON.stringify({ type: 'join', from: newName }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[600px] bg-[#141414] rounded-2xl border border-[#2a2a2a] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[#2a2a2a] flex justify-between items-center bg-[#1a1a1a] rounded-t-2xl">
          <h1 className="text-xl font-semibold text-gray-200">⚡ Gray Chat</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm bg-[#282828] px-3 py-1 rounded-full border border-[#3a3a3a]">
              {username}
            </span>
            <button
              onClick={changeUsername}
              className="bg-[#333] hover:bg-[#444] px-3 py-1 rounded-full text-sm transition"
            >
              ✎
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#141414]">
          {messages.map((msg, idx) => {
            if (msg.type === 'system') {
              return (
                <div key={idx} className="text-center text-gray-500 text-sm">
                  {msg.text}
                </div>
              );
            }
            const isSelf = msg.from === username;
            return (
              <div key={idx} className={`flex items-start gap-3 ${isSelf ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-sm font-bold border border-[#3a3a3a] flex-shrink-0">
                  {msg.from.charAt(0).toUpperCase()}
                </div>
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${isSelf ? 'bg-[#2a2a2a] rounded-tr-none' : 'bg-[#1e1e1e] rounded-tl-none'} border border-[#2e2e2e]`}>
                  <div className="text-xs text-gray-400 flex justify-between gap-4">
                    <span className="font-semibold">{msg.from}</span>
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="mt-1">{msg.text}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#1a1a1a] bg-[#141414] rounded-b-2xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-[#1e1e1e] border border-[#2e2e2e] rounded-full px-5 py-3 text-gray-200 focus:outline-none focus:border-[#555] transition"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="bg-[#2a2a2a] hover:bg-[#3a3a3a] px-6 py-2 rounded-full border border-[#3a3a3a] transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
