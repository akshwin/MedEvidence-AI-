export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        textArea.remove()
        return true
      } catch (err) {
        textArea.remove()
        return false
      }
    }
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

export function formatDate(date: Date | string | number): string {
  if (typeof date === 'number') {
    return date.toString()
  }
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatAuthors(authors?: string[], maxAuthors = 3): string {
  if (!authors || authors.length === 0) return 'Unknown authors'
  if (authors.length === 1 || maxAuthors <= 1) return authors[0]
  if (authors.length === 2 || maxAuthors === 2) return `${authors[0]} and ${authors[1]}`
  if (authors.length <= maxAuthors) {
    return `${authors.slice(0, -1).join(', ')}, and ${authors[authors.length - 1]}`
  }
  return `${authors[0]} et al.`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}