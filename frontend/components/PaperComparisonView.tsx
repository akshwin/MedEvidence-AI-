'use client'

import { useState, useEffect } from 'react'
import { X, FileText, Calendar, User, BookOpen, ExternalLink, Trash2 } from 'lucide-react'
import { Paper, dashboardApi, searchApi } from '@/lib/api'
import { formatAuthors, formatDate } from '@/lib/utils'
import { useToast } from '@/lib/toast-context'
import ConfirmDialog from './ConfirmDialog'

interface PaperComparisonViewProps {
  paperIds: string[]
  onClose: () => void
  onRemovePaper?: (paperId: string) => void
}

export default function PaperComparisonView({ paperIds, onClose, onRemovePaper }: PaperComparisonViewProps) {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; paperId: string | null }>({ isOpen: false, paperId: null })
  const { showToast } = useToast()

  useEffect(() => {
    loadPapers()
  }, [paperIds])

  const loadPapers = async () => {
    if (paperIds.length === 0) {
      setPapers([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Fetch papers by their IDs
      const fetchedPapers: Paper[] = []
      for (const paperId of paperIds) {
        try {
          // Fetch paper by PMID
          const paper = await searchApi.getPaperById(paperId)
          fetchedPapers.push(paper)
        } catch (error) {
          console.error(`Failed to fetch paper ${paperId}:`, error)
        }
      }
      setPapers(fetchedPapers)
    } catch (error) {
      console.error('Error loading papers:', error)
      showToast('Failed to load papers for comparison', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePaper = (paperId: string) => {
    setDeleteDialog({ isOpen: true, paperId })
  }

  const handleRemoveConfirm = () => {
    if (deleteDialog.paperId && onRemovePaper) {
      onRemovePaper(deleteDialog.paperId)
      setDeleteDialog({ isOpen: false, paperId: null })
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (papers.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paper Comparison</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">No papers to compare. Please select papers first.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
        <div className="min-h-screen p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-7xl mx-auto my-8">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paper Comparison</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Comparing {papers.length} paper{papers.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Comparison Grid */}
            <div className="p-6">
              <div className={`grid gap-6 ${papers.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {papers.map((paper, index) => (
                  <div
                    key={paper.pmid}
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 relative"
                  >
                    {onRemovePaper && papers.length > 2 && (
                      <button
                        onClick={() => handleRemovePaper(paper.pmid)}
                        className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {paper.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">{paper.journal}</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatAuthors(paper.authors)}
                          </span>
                        </div>
                      </div>

                      {paper.year && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">{paper.year}</span>
                        </div>
                      )}

                      {paper.abstract && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Abstract</p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-6">
                            {paper.abstract}
                          </p>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium"
                        >
                          <span>View on PubMed</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Remove Paper"
        message="Are you sure you want to remove this paper from the comparison?"
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleRemoveConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, paperId: null })}
        type="danger"
      />
    </>
  )
}

