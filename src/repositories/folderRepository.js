import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { notesRepository } from '../repositories/notesRepository'

export const folderRepository = {
  async fetchFolderList() {
    const querySnapshot = await getDocs(collection(db, 'test_note_folders'))
    return querySnapshot.docs.map((snapshot) => ({
      ...snapshot.data(),
      id: snapshot.id,
    }))
  },

  async createFolder(folder) {
    const { id, ...data } = folder
    await setDoc(doc(db, 'test_note_folders', id), data)
  },

  async deleteFolder(id) {
    await notesRepository.deleteAllNotesInFolder(id)
    await deleteDoc(doc(db, 'test_note_folders', id))
  },
}

