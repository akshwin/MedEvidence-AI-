'use client'

import { useState, useEffect } from 'react'
import { Search, Trash2, Share2, X, MessageSquare, Calendar, FileText, Loader2, Archive, ArchiveRestore, MessageSquarePlus } from 'lucide-react'
import { conversationsApi, ConversationData } from '@/lib/api'
import { useToast } from '@/lib/toast-context'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import ConfirmDialog from './ConfirmDialog'

export default function ChatHistory() {
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [sharingId, setSharingId] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; conversationId: string | null }>({
    isOpen: false,
    conversationId: null
  })
  const { showToast } = useToast()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, showArchived, searchQuery])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await conversationsApi.list({
        archived: showArchived || undefined,
        search: searchQuery || undefined,
        limit: 50
      })
      setConversations(data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
      showToast('Failed to load chat history', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleteDialog({ isOpen: true, conversationId: id })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.conversationId) return

    try {
      await conversationsApi.delete(deleteDialog.conversationId)
      showToast('Conversation deleted', 'success')
      setDeleteDialog({ isOpen: false, conversationId: null })
      loadConversations()
    } catch (error: any) {
      console.error('Delete error:', error)
      if (error.response?.status === 401) {
        showToast('Please sign in to delete conversations', 'error')
      } else {
        showToast('Failed to delete conversation', 'error')
      }
      setDeleteDialog({ isOpen: false, conversationId: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, conversationId: null })
  }

  const handleShare = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // If already shared, just copy the existing link
    const conversation = conversations.find(c => c.id === id)
    if (conversation?.is_shared && conversation?.share_token) {
      const shareUrl = `${window.location.origin}/shared/${conversation.share_token}`
      await copyToClipboard(shareUrl)
      return
    }
    
    setSharingId(id)
    try {
      const result = await conversationsApi.share(id)
      const shareUrl = `${window.location.origin}/shared/${result.share_token}`
      await copyToClipboard(shareUrl)
      loadConversations()
    } catch (error: any) {
      console.error('Share error:', error)
      if (error.response?.status === 401) {
        showToast('Please sign in to share conversations', 'error')
      } else if (error.response?.status === 404) {
        showToast('Conversation not found', 'error')
      } else {
        showToast(error.response?.data?.detail || 'Failed to generate share link', 'error')
      }
    } finally {
      setSharingId(null)
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

  const handleArchive = async (id: string, archive: boolean, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await conversationsApi.update(id, { is_archived: archive })
      showToast(archive ? 'Conversation archived' : 'Conversation restored', 'success')
      loadConversations()
    } catch (error: any) {
      console.error('Archive error:', error)
      if (error.response?.status === 401) {
        showToast('Please sign in to archive conversations', 'error')
      } else {
        showToast('Failed to update conversation', 'error')
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Sign in to view chat history
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your conversations will be saved automatically when you're signed in.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Chat History</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/research"
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-medium text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 inline-flex items-center space-x-2"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>New Chat</span>
          </Link>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              showArchived
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Conversations List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No conversations found' : showArchived ? 'No archived conversations' : 'No conversations yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            {searchQuery
              ? 'Try a different search term'
              : showArchived
              ? 'Archived conversations will appear here'
              : 'Start a conversation to see it here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between">
                <Link
                  href={`/conversations/${conv.id}`}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {conv.title || 'Untitled Conversation'}
                    </h3>
                    {conv.is_shared && (
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
                        Shared
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{conv.message_count} message{conv.message_count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(conv.updated_at)}</span>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleShare(conv.id, e)
                    }}
                    disabled={sharingId === conv.id}
                    className={`p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all ${
                      sharingId === conv.id ? 'opacity-50 cursor-not-allowed' : ''
                    } ${conv.is_shared ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
                    title={conv.is_shared ? 'Copy share link' : 'Share conversation'}
                    type="button"
                  >
                    {sharingId === conv.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleArchive(conv.id, !conv.is_archived, e)
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title={conv.is_archived ? 'Restore conversation' : 'Archive conversation'}
                    type="button"
                  >
                    {conv.is_archived ? (
                      <ArchiveRestore className="w-4 h-4" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(conv.id, e)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Delete conversation"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        type="danger"
      />
    </div>
  )
}

