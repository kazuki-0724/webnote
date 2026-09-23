export function encodeShareToken(userId, noteId) {
  if (!userId || !noteId) return ''

  const fnv1a32 = (text) => {
    let hash = 2166136261
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i)
      hash = Math.imul(hash, 16777619)
    }
    return hash >>> 0
  }

  const seed = `${userId}:${noteId}`
  const first = fnv1a32(seed)
  const second = fnv1a32(`${seed}|${seed.length}`)

  return `${first.toString(36).padStart(8, '0')}${second.toString(36).padStart(8, '0')}`
    .slice(0, 16)
}
