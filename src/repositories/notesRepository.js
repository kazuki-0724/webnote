import { collection, getDocs, updateDoc, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export const notesRepository = {
  async fetchAllNotes(uid) {
    if (!uid) return Promise.resolve([])
    const querySnapshot = await getDocs(collection(db, 'users', uid, `notes`))
    return querySnapshot.docs.map((snapshot) => ({
      ...snapshot.data(),
      id: snapshot.id,
    }))
  },

  subscribeToNotes(uid, callback) {
    if (!uid) {
      callback([])
      return () => {}
    }
    const notesCollection = collection(db, 'users', uid, `notes`)

    const unsubscribe = onSnapshot(
      notesCollection,
      (querySnapshot) => {
        const nextNotes = querySnapshot.docs.map((snapshot) => ({
          ...snapshot.data(),
          id: snapshot.id,
        }))
        callback(nextNotes)
      },
      (error) => {
        console.error('Failed to sync notes:', error)
      }
    )

    return unsubscribe
  },

  async createNote(uid, note) {
    if (!uid) return Promise.resolve([])
    const { id, ...data } = note
    await setDoc(doc(db, 'users', uid, `notes`, id), { ...data })
  },

  async updateNote(uid, id, patch) {
    if (!uid) return Promise.resolve([])
    await updateDoc(doc(db, 'users', uid, `notes`, id), patch)
  },

  async deleteNote(uid, id) {
    if (!uid) return Promise.resolve([])
    await deleteDoc(doc(db, 'users', uid, `notes`, id))
  },
  
  async deleteAllNotesInFolder(uid, folderId) {
    if (!uid) return Promise.resolve([])
    const querySnapshot = await getDocs(collection(db, 'users', uid, `notes`))
    const batch = querySnapshot.docs
      .filter((snapshot) => snapshot.data().folderId === folderId)
      .map((snapshot) => deleteDoc(doc(db, 'users', uid, `notes`, snapshot.id)))
    await Promise.all(batch)
  },

  subscribeToNote(uid, id, callback) {
    if (!uid) {
      callback([])
      return () => {}
    }
    const docRef = doc(db, 'users', uid, `notes`, id)
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback(null)
        return
      }

      callback({
        ...snapshot.data(),
        id: snapshot.id,
      })
    }, (error) => {
      console.error(`Failed to sync note ${id}:`, error)
    })

    return unsubscribe
  },
}
