import { collection, getDocs, updateDoc, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { FIRESTORE_COLLECTIONS } from '../constrants/firestore'

export const notesRepository = {
  async fetchAllNotes() {
    const querySnapshot = await getDocs(collection(db, FIRESTORE_COLLECTIONS.NOTES))
    return querySnapshot.docs.map((snapshot) => ({
      ...snapshot.data(),
      id: snapshot.id,
    }))
  },

  subscribeToNotes(callback) {
    const notesCollection = collection(db, FIRESTORE_COLLECTIONS.NOTES)

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

  async createNote(note) {
    const { id, ...data } = note
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.NOTES, id), data)
  },

  async updateNote(id, patch) {
    await updateDoc(doc(db, FIRESTORE_COLLECTIONS.NOTES, id), patch)
  },

  async deleteNote(id) {
    await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.NOTES, id))
  },
  
  async deleteAllNotesInFolder(folderId) {
    const querySnapshot = await getDocs(collection(db, FIRESTORE_COLLECTIONS.NOTES))
    const batch = querySnapshot.docs
      .filter((snapshot) => snapshot.data().folderId === folderId)
      .map((snapshot) => deleteDoc(doc(db, FIRESTORE_COLLECTIONS.NOTES, snapshot.id)))
    await Promise.all(batch)
  },

  subscribeToNote(id, callback) {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.NOTES, id)
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
