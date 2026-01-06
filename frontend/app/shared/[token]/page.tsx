'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Brain, ArrowLeft, Download, Loader2 } from 'lucide-react'
import { conversationsApi, ConversationDetail } from '@/lib/api'
import Message from '@/components/Message'
import { downloadAnswerPDF } from '@/lib/pdf-utils'
import { useToast } from '@/lib/toast-context'
import ThemeToggle from '@/components/ThemeToggle'

export default function SharedConversationPage() {
  const params = useParams()
  const shareToken = params.token as string
  const [conversation, setConversation] = useState<ConversationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    if (shareToken) {
      loadSharedConversation()
    }
  }, [shareToken])

  const loadSharedConversation = async () => {
    try {
      setLoading(true)
      const data = await conversationsApi.getShared(shareToken)
      setConversation(data)
    } catch (error) {
      console.error('Failed to load shared conversation:', error)
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!conversation) return

    const userMessages = conversation.messages.filter(m => m.role === 'user')
    const assistantMessages = conversation.messages.filter(m => m.role === 'assistant')

    if (userMessages.length > 0 && assistantMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1]
      const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]
      
      const filename = `medevidence-${conversation.title?.substring(0, 30).replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'conversation'}-${Date.now()}.pdf`
      downloadAnswerPDF(
        lastUserMessage.content,
        lastAssistantMessage.content,
        lastAssistantMessage.citations || [],
        filename
      )
      showToast('PDF downloaded successfully!', 'success')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading shared conversation...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Brain className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Conversation Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This shared conversation may have been deleted or the link is invalid.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  MedEvidence AI
                </h1>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Shared Conversation</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="h-6 w-px bg-gray-200 dark:border-gray-700 hidden md:block" />
              <button
                onClick={handleDownload}
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <Link
                href="/"
                className="hidden md:flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Home</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <div className="mb-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span>🔗</span>
            <span>Shared Conversation</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {conversation.title || 'Shared Conversation'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(conversation.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <div className="space-y-6">
            {conversation.messages.map((message, index) => (
              <Message
                key={index}
                role={message.role}
                content={message.content}
                citations={message.citations}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}




