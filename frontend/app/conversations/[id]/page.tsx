'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Share2, Trash2, Download, Loader2 } from 'lucide-react'
import { conversationsApi, ConversationDetail } from '@/lib/api'
import Message from '@/components/Message'
import { downloadAnswerPDF } from '@/lib/pdf-utils'
import { useToast } from '@/lib/toast-context'
import ConfirmDialog from '@/components/ConfirmDialog'
import AppHeader from '@/components/AppHeader'
import RequireAuth from '@/components/RequireAuth'

export default function ConversationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  const [conversation, setConversation] = useState<ConversationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const { showToast } = useToast()

  const loadConversation = useCallback(async () => {
    try {
      setLoading(true)
      const data = await conversationsApi.get(conversationId)
      setConversation(data)
    } catch (error) {
      console.error('Failed to load conversation:', error)
      showToast('Failed to load conversation', 'error')
      router.push('/conversations')
    } finally {
      setLoading(false)
    }
  }, [conversationId, router, showToast])

  useEffect(() => {
    if (conversationId) {
      loadConversation()
    }
  }, [conversationId, loadConversation])

  const handleDeleteClick = () => {
    setDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await conversationsApi.delete(conversationId)
      showToast('Conversation deleted', 'success')
      setDeleteDialog(false)
      router.push('/conversations')
    } catch (error: any) {
      console.error('Delete error:', error)
      if (error.response?.status === 401) {
        showToast('Please sign in to delete conversations', 'error')
        router.push('/login')
      } else {
        showToast('Failed to delete conversation', 'error')
      }
      setDeleteDialog(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog(false)
  }

  const handleShare = async () => {
    // If already shared, just copy the existing link
    if (conversation?.is_shared && conversation?.share_token) {
      const shareUrl = `${window.location.origin}/shared/${conversation.share_token}`
      await copyToClipboard(shareUrl)
      return
    }

    setSharing(true)
    try {
      const result = await conversationsApi.share(conversationId)
      const shareUrl = `${window.location.origin}/shared/${result.share_token}`
      await copyToClipboard(shareUrl)
      loadConversation()
    } catch (error: any) {
      console.error('Share error:', error)
      if (error.response?.status === 401) {
        showToast('Please sign in to share conversations', 'error')
        router.push('/login')
      } else if (error.response?.status === 404) {
        showToast('Conversation not found', 'error')
      } else {
        showToast(error.response?.data?.detail || 'Failed to generate share link', 'error')
      }
    } finally {
      setSharing(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        showToast('Share link copied to clipboard!', 'success')
      } else {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          const successful = document.execCommand('copy')
          if (successful) {
            showToast('Share link copied to clipboard!', 'success')
          } else {
            showToast(`Share link: ${text}`, 'info')
          }
        } catch (err) {
          showToast(`Share link: ${text}`, 'info')
        }
        document.body.removeChild(textArea)
      }
    } catch (clipboardError) {
      console.error('Clipboard error:', clipboardError)
      showToast(`Share link: ${text}`, 'info')
    }
  }

  const handleDownload = () => {
    if (!conversation) return

    const userMessages = conversation.messages.filter((m) => m.role === 'user')
    const assistantMessages = conversation.messages.filter((m) => m.role === 'assistant')

    if (userMessages.length > 0 && assistantMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1]
      const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]

      const filename = `medevidence-${
        conversation.title
          ?.substring(0, 30)
          .replace(/[^a-z0-9]/gi, '-')
          .toLowerCase() || 'conversation'
      }-${Date.now()}.pdf`
      downloadAnswerPDF(
        lastUserMessage.content,
        lastAssistantMessage.content,
        lastAssistantMessage.citations || [],
        filename,
      )
      showToast('PDF downloaded successfully!', 'success')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return null
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader
          active="history"
          subtitle="Conversation"
          rightSlot={
            <>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm"
                type="button"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={handleShare}
                disabled={sharing}
                className={`flex items-center space-x-2 px-4 py-2 transition-colors font-medium text-sm ${
                  sharing
                    ? 'opacity-50 cursor-not-allowed text-gray-400'
                    : conversation.is_shared
                      ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
                type="button"
                title={conversation.is_shared ? 'Copy share link' : 'Share conversation'}
              >
                {sharing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span>{conversation.is_shared ? 'Copy Link' : 'Share'}</span>
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium text-sm"
                type="button"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </>
          }
        />

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/"
              className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/research"
              className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Research
            </Link>
            <span>/</span>
            <Link
              href="/conversations"
              className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              History
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">Conversation</span>
          </nav>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {conversation.title || 'Untitled Conversation'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(conversation.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
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

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog}
          title="Delete Conversation"
          message="Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently removed."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          type="danger"
        />
      </div>
    </RequireAuth>
  )
}
