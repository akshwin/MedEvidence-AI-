'use client'

import { useState } from 'react'
import { ExternalLink, FileText, TrendingUp, Copy, Check } from 'lucide-react'
import { Citation } from '@/lib/api'
import { formatAuthors, formatDate, copyToClipboard } from '@/lib/utils'
import { useToast } from '@/lib/toast-context'
import PaperActions from './PaperActions'

interface CitationProps {
  citation: Citation
}

export default function CitationComponent({ citation }: CitationProps) {
  const [copied, setCopied] = useState(false)
  const { success } = useToast()
  const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}`

  const handleCopyCitation = async () => {
    const citationText = `${citation.title}. ${formatAuthors(citation.authors)}. ${citation.journal || ''} ${citation.year || ''}. PMID: ${citation.pmid}`
    const success = await copyToClipboard(citationText)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl p-5 hover:shadow-lg transition-all group hover:border-emerald-300 dark:hover:border-emerald-600">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 leading-snug text-base">
                {citation.title}
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{formatAuthors(citation.authors)}</span>
                  {citation.year && (
                    <span className="text-gray-500 dark:text-gray-400"> • {formatDate(citation.year)}</span>
                  )}
                </p>
                {citation.journal && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic font-medium">{citation.journal}</p>
                )}
                {citation.relevance_score && (
                  <div className="flex items-center space-x-3 mt-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${citation.relevance_score * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center space-x-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{(citation.relevance_score * 100).toFixed(0)}% match</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex flex-col items-end space-y-2">
          <PaperActions 
            paper={{
              pmid: citation.pmid,
              title: citation.title,
              authors: citation.authors,
              year: citation.year,
              journal: citation.journal
            }}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleCopyCitation}
              className="w-12 h-12 bg-white dark:bg-gray-700 border-2 border-emerald-200 dark:border-emerald-600 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all group-hover:shadow-md transform group-hover:scale-110"
              title="Copy citation"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
            <a
              href={pubmedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-white dark:bg-gray-700 border-2 border-emerald-200 dark:border-emerald-600 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all group-hover:shadow-md transform group-hover:scale-110"
              title="View on PubMed"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
