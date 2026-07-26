<!-- src/components/TestFirestore.vue -->
<script setup>
import { ref } from 'vue'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '../firebase' // 環境変数を設定した firebase.js をインポート

const status = ref('待機中...')
const testData = ref([])

let notes = ref([])
notes.value.push({ id: 1, title: 'ノート1', content: 'これはノート1の内容です。' })
notes.value.push({ id: 2, title: 'ノート2', content: 'これはノート2の内容です。' })
notes.value.push({ id: 3, title: 'ノート3', content: 'これはノート3の内容です。' })


// データの書き込み（Create）
const handleWrite = async () => {
  status.value = '書き込み中...'
  try {
    // "test_collection" というコレクションにデータを追加
    notes.value.forEach(async (note) => {
      await addDoc(collection(db, 'test_notes'), note)
    })
    status.value = `✅ 書き込み成功 (${notes.value.length}件)`
  } catch (error) {
    status.value = `❌ 書き込みエラー: ${error.message}`
    console.error("Write Error:", error)
  }
}

// データの読み込み（Read）
const handleRead = async () => {
  status.value = '読み込み中...'
  testData.value = [] // リセット
  try {
    const querySnapshot = await getDocs(collection(db, 'test_notes'))
    
    querySnapshot.forEach((doc) => {
      testData.value.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    status.value = `✅ 読み込み成功 (${testData.value.length}件)`
  } catch (error) {
    status.value = `❌ 読み込みエラー: ${error.message}`
    console.error("Read Error:", error)
  }
}
</script>

<template>
  <div style="padding: 20px; border: 1px solid #ccc; border-radius: 8px; max-width: 500px;">
    <h2>Firestore 接続テスト</h2>
    
    <div style="margin-bottom: 20px;">
      <button @click="handleWrite" style="margin-right: 10px;">データを書き込む</button>
      <button @click="handleRead">データを読み込む</button>
    </div>

    <div style="background: #f5f5f5; padding: 10px; margin-bottom: 20px;">
      <strong>ステータス:</strong> {{ status }}
    </div>

    <div v-if="testData.length > 0">
      <h3>取得したデータ:</h3>
      <ul>
        <li v-for="item in testData" :key="item.id">
          {{ item.title }}: {{ item.content }} <small>({{ item.id }})</small>
        </li>
      </ul>
    </div>
  </div>
</template>