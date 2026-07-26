export function escapeHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function extractUrls(text) {
  if (!text) return []
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.match(urlRegex) || []
}

export function linkify(text) {
  if (!text)
    return '<span class="text-slate-400/80 italic">ここにアイデアを書き留めましょう...</span>'
  let escaped = escapeHTML(text)
  const urlRegex = /(https?:\/\/[^\s]+)/g
  escaped = escaped.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-sky-500 hover:text-sky-600 underline decoration-sky-200 underline-offset-4 hover:decoration-sky-400 transition-all font-semibold pointer-events-auto cursor-pointer" onclick="event.stopPropagation()">${url}</a>`
  })
  return escaped.replace(/\n/g, '<br>')
}

export function formatDate(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
}
