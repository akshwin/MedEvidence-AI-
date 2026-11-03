'use client'

import { useState } from 'react'
import {
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Copy,
  Check,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Citation } from '@/lib/api'
import CitationComponent from './Citation'
import { formatAuthors } from '@/lib/utils'
import { copyToClipboard } from '@/lib/utils'
import { useToast } from '@/lib/toast-context'

interface MessageProps {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}

export default function Message({ role, content, citations }: MessageProps) {
  const [showCitations, setShowCitations] = useState(false)
  const [copied, setCopied] = useState(false)
  const { success } = useToast()

  const handleCopy = async () => {
    const success = await copyToClipboard(content)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={`flex space-x-4 ${role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
          role === 'user'
            ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600'
            : 'bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-600'
        }`}
      >
        {role === 'user' ? (
          <User className="w-6 h-6 text-white" />
        ) : (
          <Sparkles className="w-6 h-6 text-white" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 ${role === 'user' ? 'text-right' : ''}`}>
        <div
          className={`inline-block max-w-[85%] px-6 py-4 rounded-2xl shadow-lg ${
            role === 'user'
              ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-600 rounded-tl-sm'
          }`}
        >
          {role === 'assistant' && (
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1"></div>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
          {role === 'assistant' ? (
            <div className="markdown-content">
              <ReactMarkdown
                components={{
                  h2: ({ node, ...props }: any) => (
                    <h2
                      className="text-xl font-bold mt-6 mb-4 text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-200 dark:border-emerald-800 pb-2 first:mt-0"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }: any) => (
                    <h3
                      className="text-lg font-semibold mt-4 mb-3 text-teal-700 dark:text-teal-400"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }: any) => (
                    <p
                      className="leading-relaxed mb-3 text-gray-700 dark:text-gray-200 last:mb-0"
                      {...props}
                    />
                  ),
                  strong: ({ node, ...props }: any) => (
                    <strong className="font-semibold text-gray-900 dark:text-white" {...props} />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed text-base">{content}</p>
          )}
        </div>

        {/* Citations */}
        {citations && citations.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="inline-flex items-center space-x-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
            >
              <FileText className="w-4 h-4" />
              <span>
                {citations.length} source{citations.length > 1 ? 's' : ''}
              </span>
              {showCitations ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showCitations && (
              <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
                {citations.map((citation, index) => (
                  <CitationComponent key={index} citation={citation} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
