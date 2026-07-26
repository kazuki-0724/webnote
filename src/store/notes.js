import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, getDocs, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { folderRepository } from '../repositories/folderRepository'
import { notesRepository } from '../repositories/notesRepository'

export const useNotesStore = defineStore('notes', () => {
  // --- State ---
  const folders = ref([])
  const notes = ref([])

  const selectedNoteId = ref('n1')
  const mobileView = ref('sidebar') // 'sidebar' | 'editor'
  const isCreatingFolder = ref(false)
  const isEditingContent = ref(false)
  // 展開中のフォルダIDリスト（全フォルダをデフォルトで展開）
  const expandedFolderIds = ref(['general', 'f1', 'f2'])
  const deleteConfirm = ref({ isOpen: false, type: null, targetId: null })
  const searchQuery = ref('')

  // --- Computed ---
  const selectedNote = computed(
    () => notes.value.find((n) => n.id === selectedNoteId.value) || null
  )

  const searchResults = computed(() => {
    if (!searchQuery.value.trim()) return []
    const q = searchQuery.value.toLowerCase()
    return notes.value.filter(
      (n) =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q))
    )
  })

  // フォルダごとのノート一覧（更新日時降順）
  const notesByFolder = computed(() => {
    const result = {}
    for (const folder of folders.value) {
      result[folder.id] = notes.value
        .filter((n) => n.folderId === folder.id)
        .sort((a, b) => b.updatedAt - a.updatedAt)
    }
    return result
  })

  // --- Actions ---
  function initNotesStore() {
    folderRepository.fetchFolderList()
    .then((f) => (folders.value = f))
    .catch((err) => console.error('Failed to fetch folders:', err))

    notesRepository.fetchAllNotes()
    .then((n) => (notes.value = n))
    .catch((err) => console.error('Failed to fetch notes:', err))
    
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
    selectedNoteId.value = id
    isEditingContent.value = false
    mobileView.value = 'editor'
  }

  function setMobileView(view) {
    mobileView.value = view
    isEditingContent.value = false
  }

  async function moveNote(newFolderId) {
    const note = notes.value.find((n) => n.id === selectedNoteId.value)
    if (note && newFolderId) {
      note.folderId = newFolderId
      note.updatedAt = Date.now()
      if (!expandedFolderIds.value.includes(newFolderId)) {
        expandedFolderIds.value.push(newFolderId)
      }

      await updateDoc(doc(db, 'test_notes', note.id), {
        folderId: note.folderId,
        updatedAt: note.updatedAt,
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
    folderRepository.createFolder(folder)
      .then(() => {
        folders.value.push(folder)
      })
      .catch((err) => console.error('Failed to create folder:', err))

  }

  function deleteFolder(folderId) {
    folderRepository.deleteFolder(folderId)
      .then(() => {
        folders.value = folders.value.filter((f) => f.id !== folderId)
        notes.value = notes.value.filter((n) => n.folderId !== folderId)
      })
      .catch((err) => console.error('Failed to delete folder:', err))
  }

  function createNote(folderId) {
    const note = {
      id: `n${Date.now()}`,
      title: '',
      content: '',
      folderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    notesRepository.createNote(note)
      .then(() => {
        notes.value.push(note)
        toggleFolderExpansion(folderId)
        selectNote(note.id)
      })
      .catch((err) => console.error('Failed to create note:', err))   
  }

  function updateNoteTitle(noteId, newTitle) {
    const note = notes.value.find((n) => n.id === noteId)
    if (note) {
      note.title = newTitle
      note.updatedAt = Date.now()
      notesRepository.updateNote(noteId, {
        title: newTitle,
        updatedAt: note.updatedAt,
      })
      .catch((err) => console.error('Failed to update note:', err))
    }
  }

  function updateNoteContent(noteId, newContent) {
    const note = notes.value.find((n) => n.id === noteId)
    if (note) {
      note.content = newContent
      note.updatedAt = Date.now()
      notesRepository.updateNote(noteId, {
        content: newContent,
        updatedAt: note.updatedAt,
      })
      .catch((err) => console.error('Failed to update note:', err))
    }
  }

  function deleteNote(noteId) {
    notesRepository.deleteNote(noteId)
      .then(() => {
        notes.value = notes.value.filter((n) => n.id !== noteId)
        if (selectedNoteId.value === noteId) {
          selectedNoteId.value = null
          isEditingContent.value = false
        }
      })
      .catch((err) => console.error('Failed to delete note:', err))
  }

  
  return {
    // state
    folders,
    notes,
    selectedNoteId,
    mobileView,
    isCreatingFolder,
    isEditingContent,
    expandedFolderIds,
    deleteConfirm,
    searchQuery,
    // computed
    selectedNote,
    searchResults,
    notesByFolder,
    // actions
    initNotesStore,
    toggleFolderExpansion,
    isFolderExpanded,
    selectNote,
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
    updateNoteTitle,
    updateNoteContent,
    deleteNote,
  }
})
