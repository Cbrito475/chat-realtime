import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import './index.css'

interface Message {
  id: string
  user: string
  text: string
  time: string
}

function App() {
  const [username, setUsername] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const newSocket = io('http://localhost:3001')
    setSocket(newSocket)

    newSocket.on('messageHistory', (history: Message[]) => {
      setMessages(history)
    })

    newSocket.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleLogin = () => {
    if (username.trim()) {
      setIsLoggedIn(true)
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      socket.emit('sendMessage', { user: username, text: newMessage })
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">💬 Chat en Tiempo Real</h1>
          <input
            type="text"
            placeholder="Tu nombre"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Entrar al Chat
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">💬 Chat en Tiempo Real</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">@{username}</span>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center mt-8">No hay mensajes aún. ¡Sé el primero!</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.user === username ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.user === username
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {msg.user !== username && (
                    <p className="text-xs text-blue-400 font-semibold mb-1">{msg.user}</p>
                  )}
                  <p>{msg.text}</p>
                  <p className="text-xs text-gray-300 mt-1 text-right">{msg.time}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <footer className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Enviar
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App