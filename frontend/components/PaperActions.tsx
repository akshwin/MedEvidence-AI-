'use client'

import { useState, useEffect } from 'react'
import { Bookmark, BookmarkCheck, BookOpen, FileText, Plus, X, Loader2, Check, GitCompare, Highlighter, Sparkles } from 'lucide-react'
import { dashboardApi, Paper, PaperAnnotation } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast-context'
import PaperAnnotationEditor from './PaperAnnotationEditor'
import PaperAnalysisPanel from './PaperAnalysisPanel'

interface PaperActionsProps {
  paper: Paper | {
    pmid: string
    title: string
    authors?: string[]
    year?: number
    journal?: string
  }
  onBookmarkChange?: () => void
  showLabels?: boolean
}

export default function PaperActions({ paper, onBookmarkChange, showLabels = false }: PaperActionsProps) {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkId, setBookmarkId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingBookmark, setCheckingBookmark] = useState(false)
  const [showReadingListModal, setShowReadingListModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [readingLists, setReadingLists] = useState<any[]>([])
  const [selectedListId, setSelectedListId] = useState<string>('')
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [addingToList, setAddingToList] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [showAnnotationEditor, setShowAnnotationEditor] = useState(false)
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false)
  const [annotations, setAnnotations] = useState<PaperAnnotation[]>([])

  useEffect(() => {
    if (isAuthenticated && paper.pmid && showAnnotationEditor) {
      loadAnnotations()
    }
  }, [isAuthenticated, paper.pmid, showAnnotationEditor])

  const loadAnnotations = async () => {
    if (!paper.pmid) {
      console.error('Paper PMID is missing')
      return
    }
    try {
      const anns = await dashboardApi.listAnnotations({ paper_id: paper.pmid })
      setAnnotations(anns || [])
    } catch (error: any) {
      console.error('Error loading annotations:', error)
      setAnnotations([])
    }
  }

  // Check if paper is bookmarked
  useEffect(() => {
    if (isAuthenticated && paper.pmid) {
      checkBookmarkStatus()
    }
  }, [isAuthenticated, paper.pmid])

  const checkBookmarkStatus = async () => {
    if (!isAuthenticated) return
    setCheckingBookmark(true)
    try {
      const result = await dashboardApi.checkBookmark(paper.pmid)
      setIsBookmarked(result.is_bookmarked)
      setBookmarkId(result.bookmark_id)
    } catch (error) {
      console.error('Error checking bookmark:', error)
    } finally {
      setCheckingBookmark(false)
    }
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to bookmark papers', 'info')
      return
    }

    setLoading(true)
    try {
      if (isBookmarked && bookmarkId) {
        // Remove bookmark
        await dashboardApi.deleteBookmark(bookmarkId)
        setIsBookmarked(false)
        setBookmarkId(null)
        showToast('Bookmark removed', 'success')
      } else {
        // Add bookmark
        const bookmark = await dashboardApi.createBookmark({
          paper_id: paper.pmid,
          paper_title: paper.title,
          paper_authors: paper.authors,
          paper_year: paper.year,
          paper_journal: paper.journal
        })
        setIsBookmarked(true)
        setBookmarkId(bookmark.id)
        showToast('Paper bookmarked!', 'success')
      }
      if (onBookmarkChange) {
        onBookmarkChange()
      }
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('already bookmarked')) {
        // Already bookmarked, just update state
        await checkBookmarkStatus()
        showToast('Paper is already bookmarked', 'info')
      } else {
        showToast('Failed to update bookmark', 'error')
        console.error('Bookmark error:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddToReadingList = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to add papers to reading lists', 'info')
      return
    }

    // Load reading lists
    try {
      const lists = await dashboardApi.listReadingLists()
      setReadingLists(lists)
      if (lists.length === 0) {
        showToast('Please create a reading list first', 'info')
        return
      }
      setShowReadingListModal(true)
    } catch (error) {
      showToast('Failed to load reading lists', 'error')
      console.error('Error loading reading lists:', error)
    }
  }

  const handleAddToSelectedList = async () => {
    if (!selectedListId) {
      showToast('Please select a reading list', 'error')
      return
    }

    setAddingToList(true)
    try {
      await dashboardApi.addPaperToReadingList(selectedListId, {
        paper_id: paper.pmid,
        paper_title: paper.title,
        paper_authors: paper.authors,
        paper_year: paper.year,
        paper_journal: paper.journal
      })
      showToast('Paper added to reading list!', 'success')
      setShowReadingListModal(false)
      setSelectedListId('')
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('already')) {
        showToast('Paper is already in this reading list', 'info')
      } else {
        showToast('Failed to add paper to reading list', 'error')
      }
      console.error('Add to list error:', error)
    } finally {
      setAddingToList(false)
    }
  }

  const handleCreateNote = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to create notes', 'info')
      return
    }

    if (!noteContent.trim()) {
      showToast('Please enter note content', 'error')
      return
    }

    setSavingNote(true)
    try {
      await dashboardApi.createNote({
        paper_id: paper.pmid,
        paper_title: paper.title,
        title: noteTitle.trim() || undefined,
        content: noteContent.trim()
      })
      showToast('Note created!', 'success')
      setShowNoteModal(false)
      setNoteTitle('')
      setNoteContent('')
    } catch (error) {
      showToast('Failed to create note', 'error')
      console.error('Create note error:', error)
    } finally {
      setSavingNote(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          disabled={loading || checkingBookmark}
          className={`p-2 rounded-lg transition-all ${
            isBookmarked
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
          } ${loading || checkingBookmark ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this paper'}
        >
          {loading || checkingBookmark ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isBookmarked ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>

        {/* Add to Reading List Button */}
        <button
          onClick={handleAddToReadingList}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
          title="Add to reading list"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Add Note Button */}
        <button
          onClick={() => setShowNoteModal(true)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
          title="Add note"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Annotations Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!paper.pmid) {
              showToast('Paper ID is missing', 'error')
              return
            }
            setShowAnnotationEditor(true)
            // Load annotations when opening
            if (isAuthenticated && paper.pmid) {
              loadAnnotations()
            }
          }}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all"
          title="Annotate & highlight"
          type="button"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        {/* Analysis Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!paper.pmid) {
              showToast('Paper ID is missing', 'error')
              return
            }
            setShowAnalysisPanel(true)
          }}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
          title="View recommendations & related papers"
          type="button"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Annotation Editor Modal */}
      {showAnnotationEditor && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAnnotationEditor(false)
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <PaperAnnotationEditor
              paper={paper}
              annotations={annotations}
              onAnnotationsChange={() => {
                loadAnnotations()
              }}
              onClose={() => setShowAnnotationEditor(false)}
            />
          </div>
        </div>
      )}

      {/* Analysis Panel Modal */}
      {showAnalysisPanel && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAnalysisPanel(false)
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <PaperAnalysisPanel
              paper={paper}
              onClose={() => setShowAnalysisPanel(false)}
            />
          </div>
        </div>
      )}

      {/* Reading List Modal */}
      {showReadingListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReadingListModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add to Reading List</h3>
              <button
                onClick={() => setShowReadingListModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Reading List</label>
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose a list...</option>
                  {readingLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name} {list.paper_count > 0 && `(${list.paper_count} papers)`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddToSelectedList}
                  disabled={!selectedListId || addingToList}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {addingToList ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowReadingListModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowNoteModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Note</h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paper</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 line-clamp-2">
                  {paper.title}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note Title (Optional)</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Key findings, Important points..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note Content *</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={5}
                  placeholder="Write your notes about this paper..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateNote}
                  disabled={!noteContent.trim() || savingNote}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {savingNote ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Save Note</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowNoteModal(false)
                    setNoteTitle('')
                    setNoteContent('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

