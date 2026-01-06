'use client'

import { useState, useEffect, useRef } from 'react'
import { Highlighter, X, Save, Trash2, Palette } from 'lucide-react'
import { dashboardApi, PaperAnnotation } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast-context'

type PaperForAnnotation = {
  pmid: string
  title: string
  abstract?: string
  authors?: string[]
  year?: number
  journal?: string
}

interface PaperAnnotationEditorProps {
  paper: PaperForAnnotation
  annotations: PaperAnnotation[]
  onAnnotationsChange: () => void
  onClose?: () => void
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-200 dark:bg-yellow-900/30' },
  { name: 'Green', value: 'green', class: 'bg-green-200 dark:bg-green-900/30' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-200 dark:bg-blue-900/30' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-200 dark:bg-pink-900/30' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-200 dark:bg-orange-900/30' },
]

export default function PaperAnnotationEditor({ paper, annotations, onAnnotationsChange, onClose }: PaperAnnotationEditorProps) {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [selectedText, setSelectedText] = useState('')
  const [selectedColor, setSelectedColor] = useState('yellow')
  const [annotationNote, setAnnotationNote] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [editingAnnotation, setEditingAnnotation] = useState<PaperAnnotation | null>(null)
  const abstractRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abstractRef.current || !paper.abstract) return

    // Apply existing highlights
    applyHighlights()
    
    // Add text selection listener
    const handleSelection = () => handleTextSelection()
    document.addEventListener('mouseup', handleSelection)
    document.addEventListener('keyup', handleSelection)
    
    return () => {
      document.removeEventListener('mouseup', handleSelection)
      document.removeEventListener('keyup', handleSelection)
    }
  }, [annotations, paper.abstract])

  const applyHighlights = () => {
    if (!abstractRef.current || !paper.abstract) return

    let html = paper.abstract
    annotations.forEach((ann) => {
      if (ann.selected_text && ann.start_offset !== null && ann.end_offset !== null) {
        const colorClass = HIGHLIGHT_COLORS.find(c => c.value === ann.color)?.class || HIGHLIGHT_COLORS[0].class
        const highlighted = `<mark class="${colorClass} annotation-${ann.id}" data-annotation-id="${ann.id}">${ann.selected_text}</mark>`
        // Simple replacement - in production, use proper text range handling
        html = html.replace(ann.selected_text, highlighted)
      }
    })
    if (abstractRef.current) {
      abstractRef.current.innerHTML = html
    }
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const selectedText = selection.toString().trim()
    if (selectedText.length < 3) {
      setSelectedText('')
      return
    }

    // Calculate offsets relative to the abstract text
    const range = selection.getRangeAt(0)
    const abstractText = paper.abstract || ''
    
    // Get the text before the selection in the abstract
    const preRange = document.createRange()
    preRange.selectNodeContents(abstractRef.current!)
    preRange.setEnd(range.startContainer, range.startOffset)
    const startOffset = preRange.toString().length
    
    const endOffset = startOffset + selectedText.length

    setSelectedText(selectedText)
    // Store offsets for later use
    ;(window as any).__lastAnnotationOffsets = { startOffset, endOffset }
  }

  const handleCreateAnnotation = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to create annotations', 'error')
      return
    }

    if (!selectedText.trim()) {
      showToast('Please select text to annotate', 'error')
      return
    }

    if (!paper.pmid) {
      showToast('Paper ID is missing', 'error')
      return
    }

    try {
      // Get stored offsets or calculate them
      const offsets = (window as any).__lastAnnotationOffsets || { startOffset: null, endOffset: null }
      
      await dashboardApi.createAnnotation({
        paper_id: paper.pmid,
        paper_title: paper.title || 'Untitled Paper',
        annotation_type: 'highlight',
        selected_text: selectedText,
        start_offset: offsets.startOffset,
        end_offset: offsets.endOffset,
        content: annotationNote || undefined,
        color: selectedColor,
      })
      showToast('Annotation created', 'success')
      setSelectedText('')
      setAnnotationNote('')
      onAnnotationsChange()
    } catch (error: any) {
      console.error('Error creating annotation:', error)
      showToast(error?.response?.data?.detail || 'Failed to create annotation', 'error')
    }
  }

  const handleDeleteAnnotation = async (id: string) => {
    try {
      await dashboardApi.deleteAnnotation(id)
      showToast('Annotation deleted', 'success')
      onAnnotationsChange()
    } catch (error) {
      showToast('Failed to delete annotation', 'error')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <Highlighter className="w-5 h-5" />
          <span>Annotations & Highlights</span>
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Selection Toolbar */}
      {selectedText && (
        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Selected Text:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{selectedText}"</p>
            </div>
            <button
              onClick={() => setSelectedText('')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">Color:</span>
            <div className="flex space-x-2">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color.value
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-gray-300 dark:border-gray-600'
                  } ${color.class}`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <textarea
            value={annotationNote}
            onChange={(e) => setAnnotationNote(e.target.value)}
            placeholder="Add a note (optional)..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm mb-3"
            rows={2}
          />

          <button
            onClick={handleCreateAnnotation}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Create Highlight</span>
          </button>
        </div>
      )}

      {/* Instructions */}
      {!selectedText && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            Select text in the abstract below to create a highlight. You can add notes to your highlights.
          </p>
        </div>
      )}

      {/* Abstract with highlights */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Abstract:</p>
        <div
          ref={abstractRef}
          onMouseUp={handleTextSelection}
          className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-text select-text"
        >
          {paper.abstract || 'No abstract available.'}
        </div>
      </div>

      {/* Existing Annotations */}
      {annotations.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Annotations:</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {annotations.map((ann) => {
              const colorClass = HIGHLIGHT_COLORS.find(c => c.value === ann.color)?.class || HIGHLIGHT_COLORS[0].class
              return (
                <div
                  key={ann.id}
                  className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                      {ann.selected_text || 'Highlight'}
                    </div>
                    <button
                      onClick={() => handleDeleteAnnotation(ann.id)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {ann.content && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{ann.content}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

