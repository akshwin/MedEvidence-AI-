import jsPDF from 'jspdf'
import { Citation, Paper } from './api'

// MedEvidence AI Brand Colors
const BRAND_COLORS = {
  primary: '#10b981', // emerald-600
  secondary: '#14b8a6', // teal-600
  accent: '#06b6d4', // cyan-600
  text: '#111827', // gray-900
  textLight: '#6b7280', // gray-500
  background: '#f0fdf4', // emerald-50
  border: '#d1fae5', // emerald-200
}

// Helper to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

// Parse markdown and return structured content
interface TextBlock {
  type: 'text' | 'h2' | 'h3' | 'bold' | 'list'
  content: string
  indent?: number
}

function parseMarkdown(text: string): TextBlock[] {
  const blocks: TextBlock[] = []
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      blocks.push({ type: 'text', content: '' })
      continue
    }

    // H2 headings (##)
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', content: line.substring(3).trim() })
    }
    // H3 headings (###)
    else if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', content: line.substring(4).trim() })
    }
    // List items (- or *)
    else if (line.match(/^[-*]\s+/)) {
      blocks.push({ type: 'list', content: line.replace(/^[-*]\s+/, ''), indent: 5 })
    }
    // Regular text with bold handling
    else {
      blocks.push({ type: 'text', content: line })
    }
  }

  return blocks
}

// Extract author name and year from citation text (e.g., "Smith et al. (2024)" -> {author: "Smith", year: 2024})
function extractAuthorAndYear(citationText: string): { author: string; year: number | null } {
  // Match patterns like "Author et al. (2024)" or "Author (2024)" or "Author Name (2024)"
  const match = citationText.match(/(.+?)\s*(?:et\s+al\.)?\s*\((\d{4})\)/)
  if (match) {
    return {
      author: match[1].trim(),
      year: parseInt(match[2], 10),
    }
  }
  // Try without year
  const authorMatch = citationText.match(/(.+?)(?:\s+et\s+al\.)?/)
  if (authorMatch) {
    return {
      author: authorMatch[1].trim(),
      year: null,
    }
  }
  return { author: citationText.trim(), year: null }
}

// Match citation to author/year pattern
function matchesCitation(citation: Citation, author: string, year: number | null): boolean {
  // Check if any author matches
  const citationAuthors = citation.authors || []
  if (citationAuthors.length === 0) return false

  // Normalize author name (remove commas, extra spaces, convert to lowercase)
  const normalizeAuthor = (name: string): string => {
    return name.replace(/,/g, '').trim().toLowerCase()
  }

  const searchAuthorNormalized = normalizeAuthor(author)

  // Check if any citation author matches
  let authorMatches = false
  for (const citationAuthor of citationAuthors) {
    const citationAuthorNormalized = normalizeAuthor(citationAuthor)

    // Extract last name (first word before comma or first word)
    const citationLastName = citationAuthorNormalized.split(/[\s,]+/)[0]
    const searchLastName = searchAuthorNormalized.split(/[\s,]+/)[0]

    // Check various matching patterns
    if (
      citationLastName === searchLastName ||
      citationAuthorNormalized.includes(searchLastName) ||
      searchAuthorNormalized.includes(citationLastName) ||
      citationAuthorNormalized === searchAuthorNormalized
    ) {
      authorMatches = true
      break
    }
  }

  // Check year match if year is provided
  if (year !== null && citation.year) {
    return authorMatches && citation.year === year
  }

  return authorMatches
}

// Order citations based on their appearance in the answer text
function orderCitationsByContent(citations: Citation[], answer: string): Citation[] {
  // Extract H3 headings (author citations) from answer
  const h3Headings: string[] = []
  const lines = answer.split('\n')

  for (const line of lines) {
    if (line.trim().startsWith('### ')) {
      const heading = line.trim().substring(4).trim()
      h3Headings.push(heading)
    }
  }

  // If no H3 headings found, return original order
  if (h3Headings.length === 0) {
    return citations
  }

  // Create ordered citations array
  const orderedCitations: Citation[] = []
  const usedCitations = new Set<number>()

  // For each H3 heading, find matching citation
  for (const heading of h3Headings) {
    const { author, year } = extractAuthorAndYear(heading)

    // Find matching citation
    for (let i = 0; i < citations.length; i++) {
      if (!usedCitations.has(i) && matchesCitation(citations[i], author, year)) {
        orderedCitations.push(citations[i])
        usedCitations.add(i)
        break
      }
    }
  }

  // Add any remaining citations that weren't matched
  for (let i = 0; i < citations.length; i++) {
    if (!usedCitations.has(i)) {
      orderedCitations.push(citations[i])
    }
  }

  return orderedCitations
}

export function downloadAnswerPDF(
  question: string,
  answer: string,
  citations: Citation[],
  filename: string = 'medevidence-answer.pdf',
) {
  // Order citations based on their appearance in the answer content
  const orderedCitations = orderCitationsByContent(citations, answer)

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 18
  const contentWidth = pageWidth - 2 * margin
  let yPos = margin

  // Helper function to add new page if needed
  const checkNewPage = (requiredHeight: number) => {
    const footerHeight = 15
    if (yPos + requiredHeight > pageHeight - margin - footerHeight) {
      doc.addPage()
      yPos = margin + 20 // Start after header
      // Redraw header on new page
      drawHeader(doc, pageWidth, margin)
      return true
    }
    return false
  }

  // Draw header function
  const drawHeader = (pdf: jsPDF, width: number, m: number) => {
    // Gradient header background
    const [r, g, b] = hexToRgb(BRAND_COLORS.primary)
    pdf.setFillColor(r, g, b)
    pdf.rect(0, 0, width, 20, 'F')

    // Secondary color accent
    const [r2, g2, b2] = hexToRgb(BRAND_COLORS.secondary)
    pdf.setFillColor(r2, g2, b2)
    pdf.rect(0, 0, width, 3, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(22)
    pdf.setFont('helvetica', 'bold')
    pdf.text('MedEvidence AI', m, 12)

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Evidence-Based Medical Research AI', m, 17.5)
  }

  // Draw header
  drawHeader(doc, pageWidth, margin)
  yPos = 28

  // Question Section with styled box
  const [pr, pg, pb] = hexToRgb(BRAND_COLORS.primary)

  // Calculate question lines first
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const questionLines = doc.splitTextToSize(question, contentWidth - 6)
  const questionBoxHeight = questionLines.length * 6 + 10

  checkNewPage(questionBoxHeight + 5)

  // Draw question box background
  doc.setFillColor(pr, pg, pb)
  doc.setGState(doc.GState({ opacity: 0.1 }))
  doc.rect(margin, yPos - 2, contentWidth, questionBoxHeight, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))

  // Draw question box border
  doc.setDrawColor(pr, pg, pb)
  doc.setLineWidth(0.5)
  doc.rect(margin, yPos - 2, contentWidth, questionBoxHeight, 'S')

  // Question label
  doc.setTextColor(pr, pg, pb)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('CLINICAL QUESTION', margin + 3, yPos + 3)

  // Question text
  yPos += 7
  doc.setTextColor(BRAND_COLORS.text)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(questionLines, margin + 3, yPos)
  yPos += questionLines.length * 6 + 8

  checkNewPage(20)

  // Answer Section Header
  doc.setTextColor(pr, pg, pb)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('EVIDENCE-BASED ANSWER', margin, yPos)
  yPos += 8

  // Parse and render markdown content
  const blocks = parseMarkdown(answer)

  for (const block of blocks) {
    checkNewPage(10)

    switch (block.type) {
      case 'h2':
        yPos += 4
        checkNewPage(10)
        doc.setFillColor(pr, pg, pb)
        doc.setGState(doc.GState({ opacity: 0.15 }))
        const h2Lines = doc.splitTextToSize(block.content, contentWidth - 4)
        const h2Height = h2Lines.length * 7 + 4
        doc.rect(margin, yPos - 1, contentWidth, h2Height, 'F')
        doc.setGState(doc.GState({ opacity: 1 }))

        doc.setTextColor(pr, pg, pb)
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text(h2Lines, margin + 2, yPos + 4)
        yPos += h2Height + 3
        break

      case 'h3':
        yPos += 3
        checkNewPage(8)
        doc.setTextColor(BRAND_COLORS.secondary)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        const h3Lines = doc.splitTextToSize(block.content, contentWidth - 4)
        doc.text(h3Lines, margin + 2, yPos)
        yPos += h3Lines.length * 6 + 3
        break

      case 'list':
        checkNewPage(6)
        doc.setTextColor(BRAND_COLORS.text)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('•', margin + (block.indent || 0), yPos)
        const listLines = doc.splitTextToSize(block.content, contentWidth - (block.indent || 0) - 4)
        doc.text(listLines, margin + (block.indent || 0) + 3, yPos)
        yPos += Math.max(listLines.length * 5, 5) + 1
        break

      case 'text':
        // Handle bold text in content
        let text = block.content
        const boldRegex = /\*\*(.*?)\*\*/g
        let lastIndex = 0
        let match
        let hasBold = boldRegex.test(text)
        boldRegex.lastIndex = 0 // Reset regex

        if (hasBold) {
          while ((match = boldRegex.exec(text)) !== null) {
            // Text before bold
            if (match.index > lastIndex) {
              const beforeText = text.substring(lastIndex, match.index)
              checkNewPage(6)
              doc.setTextColor(BRAND_COLORS.text)
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(10)
              const beforeLines = doc.splitTextToSize(beforeText, contentWidth)
              doc.text(beforeLines, margin, yPos)
              yPos += beforeLines.length * 5 + 1
            }

            // Bold text
            checkNewPage(6)
            doc.setTextColor(BRAND_COLORS.text)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            const boldLines = doc.splitTextToSize(match[1], contentWidth)
            doc.text(boldLines, margin, yPos)
            yPos += boldLines.length * 5 + 1

            lastIndex = match.index + match[0].length
          }

          // Remaining text
          if (lastIndex < text.length) {
            const remainingText = text.substring(lastIndex)
            checkNewPage(6)
            doc.setTextColor(BRAND_COLORS.text)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            const remainingLines = doc.splitTextToSize(remainingText, contentWidth)
            doc.text(remainingLines, margin, yPos)
            yPos += remainingLines.length * 5 + 1
          }
        } else {
          // If no bold formatting, render normally
          checkNewPage(6)
          doc.setTextColor(BRAND_COLORS.text)
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          const textLines = doc.splitTextToSize(text, contentWidth)
          doc.text(textLines, margin, yPos)
          yPos += Math.max(textLines.length * 5, 5) + 1
        }
        break
    }
  }

  yPos += 8
  checkNewPage(20)

  // Citations Section with styled header
  if (orderedCitations && orderedCitations.length > 0) {
    // Divider line
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 6

    doc.setTextColor(pr, pg, pb)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('REFERENCES', margin, yPos)
    yPos += 6

    orderedCitations.forEach((citation, index) => {
      // Calculate citation height first
      doc.setFontSize(10)
      const titleLines = doc.splitTextToSize(citation.title, contentWidth - 10)
      const authors = citation.authors?.slice(0, 5).join(', ') || 'Unknown authors'
      const authorCount = citation.authors?.length || 0
      const authorsText = authorCount > 5 ? `${authors} et al.` : authors
      const year = citation.year ? ` (${citation.year})` : ''
      const journal = citation.journal ? ` - ${citation.journal}` : ''
      const details = `${authorsText}${year}${journal}`
      doc.setFontSize(9)
      const detailsLines = doc.splitTextToSize(details, contentWidth - 10)
      const citationHeight =
        titleLines.length * 5.5 + detailsLines.length * 4.5 + (citation.pmid ? 6 : 0) + 8

      checkNewPage(citationHeight)

      // Citation number badge
      doc.setFillColor(pr, pg, pb)
      doc.circle(margin + 3, yPos + 1, 3, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}`, margin + 3, yPos + 2, { align: 'center' })

      // Citation content
      const titleX = margin + 10
      const citationWidth = contentWidth - 10

      // Title
      doc.setTextColor(BRAND_COLORS.text)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(titleLines, titleX, yPos + 1)
      yPos += titleLines.length * 5.5 + 1

      // Authors and details
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(BRAND_COLORS.textLight)
      doc.text(detailsLines, titleX, yPos)
      yPos += detailsLines.length * 4.5 + 1

      // PubMed link
      if (citation.pmid) {
        doc.setTextColor(pr, pg, pb)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}`
        const linkText = `PMID: ${citation.pmid} | ${pubmedUrl}`
        doc.text(linkText, titleX, yPos)
        try {
          const linkWidth = doc.getTextWidth(linkText)
          // Create link annotation - PDF viewers will handle opening in new tab based on their settings
          doc.link(titleX, yPos - 2.5, linkWidth, 3.5, {
            url: pubmedUrl,
            // Note: PDF link behavior (new tab) is controlled by PDF viewer settings
            // Most modern PDF viewers (Chrome, Firefox, Adobe Reader) open external links in new tabs by default
          })
        } catch (e) {
          // Link annotation not supported
        }
        yPos += 5
      }

      yPos += 5
    })
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)

    // Footer background
    doc.setFillColor(245, 245, 245)
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F')

    // Footer border
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.3)
    doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12)

    doc.setFontSize(8)
    doc.setTextColor(BRAND_COLORS.textLight)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Generated by MedEvidence AI • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' },
    )
    doc.text(
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      pageWidth - margin,
      pageHeight - 6,
      { align: 'right' },
    )
  }

  doc.save(filename)
}

export function downloadSearchResultsPDF(
  query: string,
  papers: Paper[],
  filename: string = 'medevidence-search-results.pdf',
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 18
  const contentWidth = pageWidth - 2 * margin
  let yPos = margin

  const checkNewPage = (requiredHeight: number) => {
    const footerHeight = 15
    if (yPos + requiredHeight > pageHeight - margin - footerHeight) {
      doc.addPage()
      yPos = margin + 20 // Start after header
      // Redraw header on new page
      drawSearchHeader(doc, pageWidth, margin)
      return true
    }
    return false
  }

  // Draw header function
  const drawSearchHeader = (pdf: jsPDF, width: number, m: number) => {
    const [r, g, b] = hexToRgb(BRAND_COLORS.primary)
    pdf.setFillColor(r, g, b)
    pdf.rect(0, 0, width, 20, 'F')

    const [r2, g2, b2] = hexToRgb(BRAND_COLORS.secondary)
    pdf.setFillColor(r2, g2, b2)
    pdf.rect(0, 0, width, 3, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(22)
    pdf.setFont('helvetica', 'bold')
    pdf.text('MedEvidence AI', m, 12)

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Medical Literature Search Results', m, 17.5)
  }

  // Draw header
  drawSearchHeader(doc, pageWidth, margin)
  yPos = 28

  // Search Query Section with styled box
  const [pr, pg, pb] = hexToRgb(BRAND_COLORS.primary)

  // Calculate query lines first
  doc.setFontSize(10.5)
  doc.setFont('helvetica', 'normal')
  const queryLines = doc.splitTextToSize(query, contentWidth - 6)
  const queryBoxHeight = queryLines.length * 5 + 8

  // Draw query box background
  doc.setFillColor(pr, pg, pb)
  doc.setGState(doc.GState({ opacity: 0.1 }))
  doc.rect(margin, yPos - 2, contentWidth, queryBoxHeight, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))

  // Draw query box border
  doc.setDrawColor(pr, pg, pb)
  doc.setLineWidth(0.5)
  doc.rect(margin, yPos - 2, contentWidth, queryBoxHeight, 'S')

  // Query label
  doc.setTextColor(pr, pg, pb)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('SEARCH QUERY', margin + 3, yPos + 2)

  // Query text
  yPos += 6
  doc.setTextColor(BRAND_COLORS.text)
  doc.setFontSize(10.5)
  doc.setFont('helvetica', 'normal')
  doc.text(queryLines, margin + 3, yPos)
  yPos += queryLines.length * 5 + 4

  // Results Summary
  doc.setTextColor(BRAND_COLORS.secondary)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Found ${papers.length} paper${papers.length > 1 ? 's' : ''}`, margin, yPos)
  yPos += 8

  checkNewPage(15)

  // Papers List
  papers.forEach((paper, index) => {
    const paperStartY = yPos

    // Calculate paper height first
    doc.setFontSize(11)
    const titleLines = doc.splitTextToSize(paper.title, contentWidth - 12)
    const abstract = paper.abstract || 'No abstract available'
    doc.setFontSize(9)
    const abstractLines = doc.splitTextToSize(abstract, contentWidth - 12)
    const maxAbstractLines = 6
    const displayAbstractLines = abstractLines.slice(0, maxAbstractLines)
    const authors = paper.authors?.slice(0, 4).join(', ') || 'Unknown authors'
    const authorCount = paper.authors?.length || 0
    const authorsText = authorCount > 4 ? `${authors} et al.` : authors
    const year = paper.year ? ` (${paper.year})` : ''
    const journal = paper.journal ? ` • ${paper.journal}` : ''
    const metadata = `${authorsText}${year}${journal}`
    doc.setFontSize(8.5)
    const metadataLines = doc.splitTextToSize(metadata, contentWidth - 12)

    const paperHeight =
      titleLines.length * 6 +
      displayAbstractLines.length * 4.5 +
      (abstractLines.length > maxAbstractLines ? 3 : 0) +
      metadataLines.length * 4.5 +
      (paper.pmid ? 7 : 0) +
      8

    checkNewPage(paperHeight + 5)

    // Paper container with subtle background
    doc.setFillColor(250, 250, 250)
    doc.setGState(doc.GState({ opacity: 0.3 }))
    doc.rect(margin, paperStartY - 2, contentWidth, paperHeight, 'F')
    doc.setGState(doc.GState({ opacity: 1 }))

    // Paper number badge
    doc.setFillColor(pr, pg, pb)
    doc.circle(margin + 5, yPos + 1, 4, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}`, margin + 5, yPos + 2, { align: 'center' })

    // Paper title
    const titleX = margin + 12
    const paperContentWidth = contentWidth - 12
    doc.setTextColor(BRAND_COLORS.text)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(titleLines, titleX, yPos + 1)
    yPos += titleLines.length * 6 + 2

    // Abstract with better formatting
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(BRAND_COLORS.textLight)
    doc.text(displayAbstractLines, titleX, yPos)
    yPos += displayAbstractLines.length * 4.5

    if (abstractLines.length > maxAbstractLines) {
      doc.setFontSize(8)
      doc.setTextColor(BRAND_COLORS.textLight)
      doc.setFont('helvetica', 'italic')
      doc.text('... (abstract truncated)', titleX, yPos)
      yPos += 3
    }

    // Metadata in a compact format
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(BRAND_COLORS.textLight)
    doc.text(metadataLines, titleX, yPos)
    yPos += metadataLines.length * 4.5 + 1

    // PubMed link with better styling
    if (paper.pmid) {
      doc.setFillColor(pr, pg, pb)
      doc.setGState(doc.GState({ opacity: 0.1 }))
      doc.rect(titleX, yPos - 1, paperContentWidth, 5, 'F')
      doc.setGState(doc.GState({ opacity: 1 }))

      doc.setTextColor(pr, pg, pb)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}`
      const linkText = `PMID: ${paper.pmid} • View on PubMed`
      doc.text(linkText, titleX + 2, yPos + 1.5)
      try {
        const linkWidth = doc.getTextWidth(linkText)
        // Create link annotation - PDF viewers will handle opening in new tab based on their settings
        doc.link(titleX, yPos - 1, linkWidth + 4, 5, {
          url: pubmedUrl,
          // Note: PDF link behavior (new tab) is controlled by PDF viewer settings
          // Most modern PDF viewers (Chrome, Firefox, Adobe Reader) open external links in new tabs by default
        })
      } catch (e) {
        // Link annotation not supported
      }
      yPos += 6
    }

    yPos += 4

    // Add separator line between papers
    if (index < papers.length - 1) {
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.3)
      doc.line(margin + 5, yPos, pageWidth - margin - 5, yPos)
      yPos += 5
    }
  })

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)

    // Footer background
    doc.setFillColor(245, 245, 245)
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F')

    // Footer border
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.3)
    doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12)

    doc.setFontSize(8)
    doc.setTextColor(BRAND_COLORS.textLight)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Generated by MedEvidence AI • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' },
    )
    doc.text(
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      pageWidth - margin,
      pageHeight - 6,
      { align: 'right' },
    )
  }

  doc.save(filename)
}
