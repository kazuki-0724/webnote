import { collection, getDocs, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'

export const notesRepository = {
  async fetchAllNotes() {
    const querySnapshot = await getDocs(collection(db, 'test_notes'))
    return querySnapshot.docs.map((snapshot) => ({
      ...snapshot.data(),
      id: snapshot.id,
    }))
  },

  async createNote(note) {
    const { id, ...data } = note
    await setDoc(doc(db, 'test_notes', id), data)
  },

  async updateNote(id, patch) {
    await updateDoc(doc(db, 'test_notes', id), patch)
  },

  async deleteNote(id) {
    await deleteDoc(doc(db, 'test_notes', id))
  },
  
  async deleteAllNotesInFolder(folderId) {
    const querySnapshot = await getDocs(collection(db, 'test_notes'))
    const batch = querySnapshot.docs
      .filter((snapshot) => snapshot.data().folderId === folderId)
      .map((snapshot) => deleteDoc(doc(db, 'test_notes', snapshot.id)))
    await Promise.all(batch)
  },
}
