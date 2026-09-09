import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { folderRepository } from '../repositories/folderRepository'
import { notesRepository } from '../repositories/notesRepository'

export const useNotesStore = defineStore('notes', () => {
  let unsubscribeNotes = null
  let unsubscribeFolders = null

  const folders = ref([])
  const notes = ref([])
  const currentUserId = ref(null)

  const selectedNoteId = ref('n1')
  const selectedFolderId = ref('all')
  const isCreateNoteModalOpen = ref(false)
  const mobileView = ref('sidebar')
  const isCreatingFolder = ref(false)
  const isEditingContent = ref(false)
  
  const expandedFolderIds = ref(['general', 'f1', 'f2'])
  const deleteConfirm = ref({ isOpen: false, type: null, targetId: null })
  const searchQuery = ref('')

  const selectedNote = computed(
    () => getNoteById(selectedNoteId.value) || null
  )

  const selectedFolder = computed(
    () => getFolderById(selectedFolderId.value) || { id: 'all', name: 'すべてのノート' }
  )

  const filteredNotes = computed(() => {
    const list = selectedFolderId.value === 'all'
      ? notes.value
      : notes.value.filter((n) => n.folderId === selectedFolderId.value)

    return [...list].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  })

  const searchResults = computed(() => {
    if (!searchQuery.value.trim()) return []
    const q = searchQuery.value.toLowerCase()
    return notes.value.filter(
      (n) =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q))
    )
  })

  const notesByFolder = computed(() => {
    const result = {}
    for (const folder of folders.value) {
      result[folder.id] = notes.value
        .filter((n) => n.folderId === folder.id)
        .sort((a, b) => b.updatedAt - a.updatedAt)
    }
    return result
  })

  function stopNotesSync() {
    if (unsubscribeNotes) {
      unsubscribeNotes()
      unsubscribeNotes = null
    }

    if (unsubscribeFolders) {
      unsubscribeFolders()
      unsubscribeFolders = null
    }
  }

  function initNotesStore(uid) {
    stopNotesSync()

    if (!uid) {
      folders.value = []
      notes.value = []
      return
    }

    currentUserId.value = uid

    unsubscribeFolders = folderRepository.subscribeToFolders(uid, (nextFolders) => {
      folders.value = nextFolders
    })

    unsubscribeNotes = notesRepository.subscribeToNotes(uid, (nextNotes) => {
      notes.value = nextNotes
    })
    
    console.log('Notes store initialized')
    console.log('Folders:', folders.value.length, 'Notes:', notes.value.length)
  }

  function toggleFolderExpansion(id) {
    const idx = expandedFolderIds.value.indexOf(id)
    if (idx >= 0) {
      expandedFolderIds.value.splice(idx, 1)
    } else {
      expandedFolderIds.value.push(id)
    }
  }

  function isFolderExpanded(id) {
    return expandedFolderIds.value.includes(id)
  }

  function selectNote(id) {
    const note = getNoteById(id)
    selectedNoteId.value = id
    if (note) {
      selectedFolderId.value = note.folderId || 'all'
    }
    isEditingContent.value = false
    mobileView.value = 'editor'
  }

  function openCreateNoteModal(folderId = selectedFolderId.value) {
    selectedFolderId.value = folderId || 'general'
    isCreateNoteModalOpen.value = true
  }

  function closeCreateNoteModal() {
    isCreateNoteModalOpen.value = false
  }

  function setMobileView(view) {
    mobileView.value = view
    isEditingContent.value = false
  }

  async function moveNote(newFolderId) {
    const note = getNoteById(selectedNoteId.value)
    if (note && newFolderId) {
      if (!expandedFolderIds.value.includes(newFolderId)) {
        expandedFolderIds.value.push(newFolderId)
      }
      await updateDoc(doc(db, 'users', currentUserId.value, 'notes', note.id), {
        folderId: newFolderId,
        updatedAt: Date.now()
      })
    }
  }

  function startEditing() {
    isEditingContent.value = true
  }

  function stopEditing() {
    isEditingContent.value = false
  }

  function openDeleteConfirm(type, targetId) {
    deleteConfirm.value = { isOpen: true, type, targetId }
  }

  function closeDeleteConfirm() {
    deleteConfirm.value = { isOpen: false, type: null, targetId: null }
  }

  function confirmDelete() {
    const { type, targetId } = deleteConfirm.value
    if (type === 'note') deleteNote(targetId)
    else if (type === 'folder') deleteFolder(targetId)
    closeDeleteConfirm()
  }

  function createFolder(folderName) {
    const folder = { id: `f${Date.now()}`, name: folderName }
    folderRepository.createFolder(currentUserId.value, folder)
      .catch((err) => console.error('Failed to create folder:', err))

  }

  function deleteFolder(folderId) {
    folderRepository.deleteFolder(currentUserId.value, folderId)
      .catch((err) => console.error('Failed to delete folder:', err))
  }

  function createNote(folderId, type = 'note') {
    const note = {
      id: `n${Date.now()}`,
      title: '',
      content: '',
      type,
      folderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...(type === 'whiteboard'
        ? {
          whiteboard: {
            canvasWidth: 40000,
            canvasHeight: 24000,
            backgroundColor: '#ffffff',
            strokes: [],
            lastSavedAt: Date.now(),
          }
        }
      : {})
    }
    notesRepository.createNote(currentUserId.value, note)
      .then(() => {
        toggleFolderExpansion(folderId)
        selectedFolderId.value = folderId
        selectNote(note.id)
      })
      .catch((err) => console.error('Failed to create note:', err))   
  }

  function pointToSegmentDistance(point, start, end) {
    const dx = end.x - start.x
    const dy = end.y - start.y

    if (dx === 0 && dy === 0) {
      return Math.hypot(point.x - start.x, point.y - start.y)
    }

    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)))
    const projectionX = start.x + t * dx
    const projectionY = start.y + t * dy
    return Math.hypot(point.x - projectionX, point.y - projectionY)
  }

  function splitStrokeByErasure(stroke, eraserStroke) {
    const points = stroke.points || []
    if (points.length < 2) return []

    const eraserRadius = Number(eraserStroke.width || 16) / 2 + 2
    const eraserPoints = eraserStroke.points || []
    const segmentsToKeep = []
    let currentChunk = [points[0]]

    for (let index = 1; index < points.length; index += 1) {
      const start = points[index - 1]
      const end = points[index]
      const threshold = eraserRadius + Number(stroke.width || 3) / 2

      const isErased = eraserPoints.some((eraserPoint) => pointToSegmentDistance(eraserPoint, start, end) <= threshold)

      if (isErased) {
        if (currentChunk.length >= 2) {
          segmentsToKeep.push({ ...stroke, points: [...currentChunk] })
        }
        currentChunk = []
      } else {
        currentChunk.push(end)
      }
    }

    if (currentChunk.length >= 2) {
      segmentsToKeep.push({ ...stroke, points: [...currentChunk] })
    }

    return segmentsToKeep
  }

  function eraseWhiteboardStroke(noteId, eraserStroke) {
    const note = getNoteById(noteId)
    if (!note || !currentUserId.value) return

    const whiteboard = note.whiteboard || {
      canvasWidth: 40000,
      canvasHeight: 24000,
      backgroundColor: '#ffffff',
      strokes: [],
      lastSavedAt: Date.now(),
    }

    const remaining = (whiteboard.strokes || []).flatMap((stroke) => {
      if (stroke.tool === 'eraser') return [stroke]
      return splitStrokeByErasure(stroke, eraserStroke)
    })

    whiteboard.strokes = remaining
    whiteboard.lastSavedAt = Date.now()
    note.type = 'whiteboard'
    note.whiteboard = whiteboard
    note.updatedAt = Date.now()

    return notesRepository.updateNote(currentUserId.value, noteId, {
      type: 'whiteboard',
      whiteboard,
      updatedAt: note.updatedAt,
    })
      .catch((err) => console.error('Failed to erase whiteboard stroke:', err))
  }

  function saveWhiteboardStroke(noteId, stroke) {
    const note = getNoteById(noteId)
    if (!note) return

    const whiteboard = note.whiteboard || {
      canvasWidth: 40000,
      canvasHeight: 24000,
      backgroundColor: '#ffffff',
      strokes: [],
      lastSavedAt: Date.now(),
    }

    if (stroke.tool === 'eraser') {
      return eraseWhiteboardStroke(noteId, stroke)
    }

    whiteboard.strokes = [...(whiteboard.strokes || []), stroke]
    whiteboard.lastSavedAt = Date.now()
    note.type = 'whiteboard'
    note.whiteboard = whiteboard
    note.updatedAt = Date.now()

    return notesRepository.updateNote(currentUserId.value, noteId, {
      type: 'whiteboard',
      whiteboard,
      updatedAt: note.updatedAt,
    })
      .catch((err) => console.error('Failed to save whiteboard stroke:', err))
  }

  function clearWhiteboard(noteId) {
    const note = getNoteById(noteId)
    if (!note) return

    const whiteboard = note.whiteboard || {
      canvasWidth: 40000,
      canvasHeight: 24000,
      backgroundColor: '#ffffff',
      strokes: [],
      lastSavedAt: Date.now(),
    }

    whiteboard.strokes = []
    whiteboard.lastSavedAt = Date.now()
    note.whiteboard = whiteboard
    note.updatedAt = Date.now()

    return notesRepository.updateNote(currentUserId.value, noteId, {
      whiteboard,
      updatedAt: note.updatedAt,
    })
      .catch((err) => console.error('Failed to clear whiteboard:', err))
  }

  function updateNoteTitle(noteId, newTitle) {
    const note = getNoteById(noteId)
    if (note) {
      notesRepository.updateNote(currentUserId.value, noteId, {
        title: newTitle,
        updatedAt: Date.now(),
      })
      .catch((err) => console.error('Failed to update note:', err))
    }
  }

  function updateNoteContent(noteId, newContent) {
    const note = getNoteById(noteId)
    if (note) {
      notesRepository.updateNote(currentUserId.value, noteId, {
        content: newContent,
        updatedAt: Date.now(),
      })
      .catch((err) => console.error('Failed to update note:', err))
    }
  }

  function deleteNote(noteId) {
    notesRepository.deleteNote(currentUserId.value, noteId)
      .then(() => {
        if (selectedNoteId.value === noteId) {
          selectedNoteId.value = null
          isEditingContent.value = false
        }
      })
      .catch((err) => console.error('Failed to delete note:', err))
  }

  function getNoteById(noteId) {
    return notes.value.find((n) => n.id === noteId)
  }
  
  function getFolderById(folderId) {
    return folders.value.find((f) => f.id === folderId)
  }

  return {
    // state
    folders,
    notes,
    selectedNoteId,
    selectedFolderId,
    isCreateNoteModalOpen,
    mobileView,
    isCreatingFolder,
    isEditingContent,
    expandedFolderIds,
    deleteConfirm,
    searchQuery,
    // computed
    selectedNote,
    selectedFolder,
    filteredNotes,
    searchResults,
    notesByFolder,
    // actions
    stopNotesSync,
    initNotesStore,
    toggleFolderExpansion,
    isFolderExpanded,
    selectNote,
    openCreateNoteModal,
    closeCreateNoteModal,
    setMobileView,
    moveNote,
    startEditing,
    stopEditing,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    createFolder,
    deleteFolder,
    createNote,
    saveWhiteboardStroke,
    clearWhiteboard,
    updateNoteTitle,
    updateNoteContent,
    deleteNote,
  }
})
