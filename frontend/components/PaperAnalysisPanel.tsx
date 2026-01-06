'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Link2, TrendingUp, Loader2, FileText, ExternalLink, X } from 'lucide-react'
import { type Paper, searchApi } from '@/lib/api'
import { formatAuthors } from '@/lib/utils'

type PaperForAnalysis = {
  pmid: string
  title: string
  abstract?: string
  authors?: string[]
  year?: number
  journal?: string
}

interface PaperAnalysisPanelProps {
  paper: PaperForAnalysis
  onClose?: () => void
}

export default function PaperAnalysisPanel({ paper, onClose }: PaperAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'related' | 'cited'>('recommendations')
  const [recommendations, setRecommendations] = useState<Paper[]>([])
  const [relatedPapers, setRelatedPapers] = useState<Paper[]>([])
  const [citedBy, setCitedBy] = useState<Paper[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [paper.pmid, activeTab])

  const loadData = async () => {
    if (!paper.pmid) {
      console.error('Paper PMID is missing')
      return
    }

    setLoading(true)
    try {
      if (activeTab === 'recommendations') {
        const response = await searchApi.getRecommendations(paper.pmid, 2)
        setRecommendations(response.papers || [])
      } else if (activeTab === 'related') {
        const response = await searchApi.getRelatedPapers(paper.pmid, 2)
        setRelatedPapers(response.papers || [])
      } else if (activeTab === 'cited') {
        const response = await searchApi.getCitedBy(paper.pmid, 2)
        setCitedBy(response.papers || [])
      }
    } catch (error: any) {
      console.error(`Error loading ${activeTab}:`, error)
      // Set empty arrays on error to show empty state
      if (activeTab === 'recommendations') {
        setRecommendations([])
      } else if (activeTab === 'related') {
        setRelatedPapers([])
      } else if (activeTab === 'cited') {
        setCitedBy([])
      }
    } finally {
      setLoading(false)
    }
  }

  const currentPapers = activeTab === 'recommendations' ? recommendations : activeTab === 'related' ? relatedPapers : citedBy

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Paper Analysis</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'recommendations'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Recommendations</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('related')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'related'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Link2 className="w-4 h-4" />
            <span>Related</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('cited')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'cited'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Cited By</span>
          </div>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : currentPapers.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No {activeTab === 'recommendations' ? 'recommendations' : activeTab === 'related' ? 'related papers' : 'citations'} found.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {currentPapers.map((p) => (
            <div
              key={p.pmid}
              className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {p.title}
              </h4>
              <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 mb-2">
                <span>{formatAuthors(p.authors, 2)}</span>
                {p.year && <span>• {p.year}</span>}
                {p.journal && <span>• {p.journal}</span>}
              </div>
              {p.abstract && (
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                  {p.abstract}
                </p>
              )}
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${p.pmid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium"
              >
                <span>View Paper</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

