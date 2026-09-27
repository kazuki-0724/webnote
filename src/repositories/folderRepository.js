import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { notesRepository } from '../repositories/notesRepository'

export const folderRepository = {
  async fetchFolderList(uid) {
    if (!uid) return Promise.resolve([])
    const querySnapshot = await getDocs(collection(db, 'users', uid, `folders`))
    return querySnapshot.docs.map((snapshot) => ({
      ...snapshot.data(),
      id: snapshot.id,
    }))
  },

  subscribeToFolders(uid, callback) {
    if (!uid) {
      callback([])
      return () => {}
    }
    const foldersCollection = collection(db, 'users', uid, `folders`)

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

  async createFolder(uid, folder) {
    if (!uid) return Promise.resolve([])
    const { id, ...data } = folder
    await setDoc(doc(db, 'users', uid, `folders`, id), data)
  },

  async deleteFolder(uid, id) {
    if (!uid) return Promise.resolve([])
    await notesRepository.deleteAllNotesInFolder(uid, id)
    await deleteDoc(doc(db, 'users', uid, `folders`, id))
  },

  async updateFolderName(uid, folderId, folderName) {
    if (!uid) return Promise.resolve([])
    const data = { name: folderName }
    await updateDoc(doc(db, 'users', uid, `folders`, folderId), data)
  },
}

