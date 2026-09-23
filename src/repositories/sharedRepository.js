import { getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { encodeShareToken } from '../utils/shareToken'

export const sharedRepository = {

    /**
     * sharedIdによって共有されたノートを取得する。
     * sharedのDBからユーザIDとノートIDを取得し、それに基づいてノートを取得する。
     * @param {string} sharedId
     * @returns {Promise<Object|null>}
     */
    async fetchSharedNoteById(sharedId) {
        if (!sharedId) return null;

        try {
            // 1. shared の取得
            const docRef = doc(db, 'shared', sharedId);
            const snapshot = await getDoc(docRef);

            console.log("shared exists:", snapshot.exists());
            if (!snapshot.exists()) {
                console.warn(`Shared note with ID ${sharedId} does not exist.`);
                return null;
            }

            const { userId, noteId } = snapshot.data();
            console.log("userId:", userId, "noteId:", noteId);
            if (!userId || !noteId) return null;

            // 2. note 本体の取得
            const noteDocRef = doc(db, 'users', userId, 'notes', noteId);
            const noteSnapshot = await getDoc(noteDocRef);

            console.log("note exists:", noteSnapshot.exists());
            if (!noteSnapshot.exists()) {
                console.warn(`Note with ID ${noteId} does not exist in users/${userId}/notes.`);
                return null;
            }

            return {
                ...noteSnapshot.data(),
                id: noteSnapshot.id,
                userId,
                noteId: noteSnapshot.id,
            };
        } catch (error) {
            console.error("Firestore fetch error:", error);
            return null;
        }
    },
    
    async insertSharedNote(userId, noteId) {
        if (!userId || !noteId) return Promise.resolve();
        const sharedId = encodeShareToken(userId, noteId);
        return setDoc(doc(db, 'shared', sharedId), { userId, noteId });
    },

    async removeSharedNote(userId, noteId) {
        if (!userId || !noteId) return Promise.resolve();
        const sharedId = encodeShareToken(userId, noteId);
        return deleteDoc(doc(db, 'shared', sharedId));
    },

    async isShared(userId, noteId) {
        if (!userId || !noteId) return false;
        const sharedId = encodeShareToken(userId, noteId);
        const docRef = doc(db, 'shared', sharedId);
        const snapshot = await getDoc(docRef);
        return snapshot.exists();
    }
}