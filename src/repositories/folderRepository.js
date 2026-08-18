import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { notesRepository } from '../repositories/notesRepository'
import { FIRESTORE_COLLECTIONS } from '../constrants/firestore'

export const folderRepository = {
  async fetchFolderList() {
    const querySnapshot = await getDocs(collection(db, FIRESTORE_COLLECTIONS.FOLDERS))
    return querySnapshot.docs.map((snapshot) => ({
      ...snapshot.data(),
      id: snapshot.id,
    }))
  },

  subscribeToFolders(callback) {
    const foldersCollection = collection(db, FIRESTORE_COLLECTIONS.FOLDERS)

    const unsubscribe = onSnapshot(
      foldersCollection,
      (querySnapshot) => {
        const nextFolders = querySnapshot.docs.map((snapshot) => ({
          ...snapshot.data(),
          id: snapshot.id,
        }))
        callback(nextFolders)
      },
      (error) => {
        console.error('Failed to sync folders:', error)
      }
    )

    return unsubscribe
  },

  async createFolder(folder) {
    const { id, ...data } = folder
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.FOLDERS, id), data)
  },

  async deleteFolder(id) {
    await notesRepository.deleteAllNotesInFolder(id)
    await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.FOLDERS, id))
  },
}

