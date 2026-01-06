'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Send, Loader2, Brain, Zap, TrendingUp, Download } from 'lucide-react'
import { queryResearch, QueryResponse } from '@/lib/api'
import Message from './Message'
import { downloadAnswerPDF } from '@/lib/pdf-utils'
import { useToast } from '@/lib/toast-context'

// Memoized example questions to prevent re-creation
const exampleQuestions = [
  {
    icon: "💊",
    text: "Latest diabetes treatments",
    query: "What are the latest treatments for diabetes?"
  },
  {
    icon: "❤️",
    text: "Exercise and heart health",
    query: "How does exercise affect cardiovascular health?"
  },
  {
    icon: "💉",
    text: "Statin side effects",
    query: "What are the side effects of statins?"
  },
  {
    icon: "🔬",
    text: "Cancer immunotherapy",
    query: "Recent advances in cancer immunotherapy"
  }
] as const

export default function OptimizedChat() {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
    citations?: QueryResponse['citations']
  }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [messages])

  // Memoized handler to prevent re-creation
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await queryResearch(userMessage)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          citations: response.citations,
        },
      ])
    } catch (error) {
      console.error('Error querying research:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showToast(`Failed to get answer: ${errorMessage}`, 'error')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your question. Please try again or check your connection.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, showToast])

  // Memoized download handler
  const handleDownloadPDF = useCallback(() => {
    let lastUserMessage = null
    let lastAssistantMessage = null
    
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!lastUserMessage && messages[i].role === 'user') {
        lastUserMessage = messages[i]
      }
      if (!lastAssistantMessage && messages[i].role === 'assistant') {
        lastAssistantMessage = messages[i]
      }
      if (lastUserMessage && lastAssistantMessage) break
    }
    
    if (lastUserMessage && lastAssistantMessage) {
      const question = lastUserMessage.content
      const answer = lastAssistantMessage.content
      const citations = lastAssistantMessage.citations || []
      
      const filename = `medevidence-${question.substring(0, 30).replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.pdf`
      downloadAnswerPDF(question, answer, citations, filename)
      showToast('PDF downloaded successfully!', 'success')
    }
  }, [messages, showToast])

  // Memoized check for citations
  const hasCitations = useMemo(() => 
    messages.some(m => m.role === 'assistant' && m.citations && m.citations.length > 0),
    [messages]
  )

  // Keyboard shortcut: Enter to submit, Shift+Enter for new line
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading && input.trim()) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }, [input, loading, handleSubmit])

  return (
    <div className="flex flex-col h-[650px] bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
      {/* Messages */}
      <div 
        ref={messagesContainerRef} 
        className={`flex-1 p-6 lg:p-8 space-y-6 min-h-0 overflow-y-auto chat-scrollbar`}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="relative mb-6 pt-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-pulse">
                <Brain className="w-10 h-10 text-white" aria-hidden="true" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-bounce" aria-hidden="true" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Ask a Clinical Question
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg text-lg">
              Get evidence-based answers with peer-reviewed citations from medical literature
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
              {exampleQuestions.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setInput(example.query)}
                  className="group px-6 py-4 text-left bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-all transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label={`Example question: ${example.text}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl" aria-hidden="true">{example.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {example.text}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Click to try</div>
                    </div>
                    <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 mb-4 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
              <span>Evidence-based • 30M+ peer-reviewed papers • Clinical focus</span>
            </div>
          </div>
        ) : (
          <>
            {hasCitations && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-medium text-sm shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  aria-label="Download conversation as PDF"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download PDF</span>
                </button>
              </div>
            )}
            {messages.map((message, index) => (
              <Message
                key={`${message.role}-${index}-${message.content.substring(0, 20)}`}
                role={message.role}
                content={message.content}
                citations={message.citations}
              />
            ))}
            {loading && (
              <div className="flex items-start space-x-4" role="status" aria-live="polite">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white animate-pulse" aria-hidden="true" />
                </div>
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border-2 border-gray-100 dark:border-gray-600 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Analyzing research papers...</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Searching through medical literature</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} aria-hidden="true" />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t-2 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 p-5 rounded-b-2xl">
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a clinical question... (e.g., 'What are the latest diabetes treatments?')"
            className="flex-1 px-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md"
            disabled={loading}
            aria-label="Ask a clinical question"
            aria-describedby="input-help"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all transform hover:-translate-y-0.5 disabled:transform-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            aria-label={loading ? "Sending question" : "Send question"}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <Send className="w-5 h-5" aria-hidden="true" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p id="input-help" className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
            <Zap className="w-3 h-3" aria-hidden="true" />
            <span>Evidence-based • Peer-reviewed citations • Clinical accuracy</span>
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
            <span>System online</span>
          </div>
        </div>
      </form>
    </div>
  )
}


