# WebNote 補助ガイダンス

## 1. プロジェクトの短い要約

WebNote は、Firebase Hosting 上で動作する Vue 3 ベースのノート管理アプリです。新規ノートやフォルダ管理、Google 認証、Firestore 連携を前提にした、ブラウザ上で動くシンプルなメモ Web アプリです。

- 技術スタック: Vue 3 + Vite + Pinia + Firebase
- 中心責務: 認証状態の管理、ノートとフォルダの同期、UI での編集操作
- 実行入口: [../src/main.js](../src/main.js), [../src/App.vue](../src/App.vue)
- 主要設定: [../package.json](../package.json), [../firebase.json](../firebase.json), [../vite.config.js](../vite.config.js)

## 2. 入口と起動手順

### 開発起動

```bash
npm install
npm run dev
```

- `npm run dev` は Vite の開発サーバー起動です。
- 実際の起動エントリは [../package.json](../package.json) の `scripts.dev` です。
- アプリ本体は [../src/main.js](../src/main.js) で `createApp` を生成し、Pinia と WebMCP を登録します。

### 本番ビルドとデプロイ

```bash
npm run build
npx firebase-tools deploy --only hosting --project <project-id>
```

または、以下のスクリプトを使います。

```bash
npm run hosting:deploy
```

- Hosting 設定は [../firebase.json](../firebase.json) にあります。
- `public: "dist"` で Vite のビルド成果物を配信します。
- `rewrites` により SPA のルーティングを index.html にフォールバックします。

### 重要な設定ファイルの役割

- [../package.json](../package.json): npm scripts と依存関係の定義
- [../vite.config.js](../vite.config.js): Vue プラグインと SVG ローダーの設定
- [../firebase.json](../firebase.json): Firebase Hosting の公開先と rewrite 設定
- [../src/firebase.js](../src/firebase.js): Firebase App / Auth / Firestore の初期化

## 3. リポジトリ構造と責務マップ

### ルート直下

- [../README.md](../README.md): デプロイ手順メモ
- [../package.json](../package.json): 実行スクリプトと依存関係
- [../firebase.json](../firebase.json): Firebase Hosting 設定
- [../vite.config.js](../vite.config.js): Vite 設定
- [../index.html](../index.html): Vite のエントリ HTML
- [../src](../src): アプリ本体
- [../doc](../doc): 補助ドキュメント
- [../release-notes](../release-notes): リリースノートの出力先
- [../test](../test): 参考用 HTML サンプルや検証用ファイル

### src 配下の主な責務

- [../src/main.js](../src/main.js): Vue アプリ起動、Pinia 有効化、WebMCP 登録
- [../src/App.vue](../src/App.vue): 認証ブロックとレイアウトの制御
- [../src/firebase.js](../src/firebase.js): Firebase 初期化と Google 認証
- [../src/store/notes.js](../src/store/notes.js): ノート/フォルダの状態管理と操作
- [../src/repositories/notesRepository.js](../src/repositories/notesRepository.js): `test_notes` への読み書き
- [../src/repositories/folderRepository.js](../src/repositories/folderRepository.js): `test_note_folders` への読み書き
- [../src/composables/useAuth.js](../src/composables/useAuth.js): 認証状態の管理と cookie 連携
- [../src/utils/authCookie.js](../src/utils/authCookie.js): 認証 cookie の保存と検証
- [../src/utils/noteUtil.js](../src/utils/noteUtil.js): 日付整形とリンク化
- [../src/components](../src/components): UI コンポーネント群
- [../src/webMCP.js](../src/webMCP.js): ブラウザ上のモデル利用ツール定義

### UI / store / repository / auth / util の分離

- UI: [../src/App.vue](../src/App.vue), [../src/components/SidebarPane.vue](../src/components/SidebarPane.vue), [../src/components/EditorPane.vue](../src/components/EditorPane.vue), [../src/components/Login.vue](../src/components/Login.vue)
- Store: [../src/store/notes.js](../src/store/notes.js)
- Repository: [../src/repositories/notesRepository.js](../src/repositories/notesRepository.js), [../src/repositories/folderRepository.js](../src/repositories/folderRepository.js)
- Auth: [../src/firebase.js](../src/firebase.js), [../src/composables/useAuth.js](../src/composables/useAuth.js), [../src/utils/authCookie.js](../src/utils/authCookie.js)
- Util: [../src/utils/noteUtil.js](../src/utils/noteUtil.js)

## 4. アーキテクチャと主要データフロー

### 認証フロー

1. [../src/App.vue](../src/App.vue) が `useAuth()` を呼び出す
2. [../src/composables/useAuth.js](../src/composables/useAuth.js) が `validateAuthCookie()` を確認する
3. cookie が存在しない場合は `authReady` を true にして未ログイン状態へ遷移する
4. Google ログイン時は [../src/firebase.js](../src/firebase.js) の `signInWithGoogle()` を呼び出し、成功後に [../src/utils/authCookie.js](../src/utils/authCookie.js) で cookie を保存する
5. ログイン成功後、[../src/App.vue](../src/App.vue) の `handleLogin()` から `store.initNotesStore()` を実行して Firestore の同期を開始する

### ノート作成・更新・削除の流れ

- ノートの一覧や更新は [../src/store/notes.js](../src/store/notes.js) の Pinia store が管理する
- `createNote()` は `notesRepository.createNote(note)` を呼び、Firestore に保存する
- `updateNoteTitle()` / `updateNoteContent()` は `notesRepository.updateNote(id, patch)` を使う
- `deleteNote()` は `notesRepository.deleteNote(id)` を使う
- Firestore では `onSnapshot` により変更が即座に UI に反映される

### フォルダ管理の流れ

- `folderRepository.subscribeToFolders()` が `test_note_folders` を監視する
- `createFolder()` は `setDoc` で新規フォルダを追加する
- `deleteFolder()` は `notesRepository.deleteAllNotesInFolder(id)` を先に実行し、フォルダに紐づくノートを削除してからフォルダ doc を削除する
- [../src/components/SidebarPane.vue](../src/components/SidebarPane.vue) でフォルダの展開状態やノート数表示を管理する

### Firestore との同期方法

- [../src/constrants/firestore.js](../src/constrants/firestore.js) にコレクション名が定義されている
- 実際のコレクション名は以下の 2 つ
  - `test_notes`
  - `test_note_folders`
- Store 側で `subscribeToNotes` / `subscribeToFolders` を走らせ、同期中のデータを `notes` / `folders` に反映する

## 5. 質問別の参照先

- 「起動方法」→ [../package.json](../package.json), [../README.md](../README.md)
- 「Firebase」→ [../firebase.json](../firebase.json), [../src/firebase.js](../src/firebase.js)
- 「認証」→ [../src/composables/useAuth.js](../src/composables/useAuth.js), [../src/utils/authCookie.js](../src/utils/authCookie.js)
- 「ノート管理」→ [../src/store/notes.js](../src/store/notes.js), [../src/repositories/notesRepository.js](../src/repositories/notesRepository.js)
- 「フォルダ管理」→ [../src/repositories/folderRepository.js](../src/repositories/folderRepository.js), [../src/components/SidebarPane.vue](../src/components/SidebarPane.vue)
- 「UI」→ [../src/App.vue](../src/App.vue), [../src/components/SidebarPane.vue](../src/components/SidebarPane.vue), [../src/components/EditorPane.vue](../src/components/EditorPane.vue)
- 「WebMCP / 拡張」→ [../src/webMCP.js](../src/webMCP.js), [../src/main.js](../src/main.js)

## 6. 変更時の注目箇所

- Firebase の接続や認証設定を変える場合: [../src/firebase.js](../src/firebase.js)
- 認証の状態判定やログイン UI を変える場合: [../src/composables/useAuth.js](../src/composables/useAuth.js), [../src/App.vue](../src/App.vue)
- フォルダ/ノートの状態や並び順を変える場合: [../src/store/notes.js](../src/store/notes.js)
- Firestore の保存先やフィールド構造を変える場合: [../src/repositories/notesRepository.js](../src/repositories/notesRepository.js), [../src/repositories/folderRepository.js](../src/repositories/folderRepository.js), [../src/constrants/firestore.js](../src/constrants/firestore.js)
- UI とモバイル表示ロジックを変える場合: [../src/components/SidebarPane.vue](../src/components/SidebarPane.vue), [../src/components/EditorPane.vue](../src/components/EditorPane.vue)

## 7. 運用メモと既知の制約

### 実行時の前提

- Firebase の環境変数が必要です。
- `.env` を使って `VITE_FIREBASE_*` 系の値を定義している前提です。
- 画面上の認証状態は cookie ベースで保持されます。

### 既知の注意点

- [../src/constrants/firestore.js](../src/constrants/firestore.js) のディレクトリ名 `constrants` は綴りが `constants` ではなく、実装側で参照されているため修正時は注意が必要です。
- Firestore のコレクション名は `test_notes` / `test_note_folders` で固定されており、環境ごとの差分は未設定です。
- `App.vue` の初期値 `selectedNoteId` は `'n1'` ですが、実際に存在しない ID でも初期状態を許容しているため、UI とデータの整合性には注意が必要です。
- WebMCP ツールは [../src/webMCP.js](../src/webMCP.js) に定義されており、ブラウザ環境で `document.modelContext` が存在するときのみ登録されます。

## 8. 典型的な質問への入口

### 「どこから始めればいい？」

- まず [../src/main.js](../src/main.js) で起動が始まることを確認する
- 次に [../src/App.vue](../src/App.vue) でログイン画面とメイン画面の切り替えを確認する
- その後、[../src/store/notes.js](../src/store/notes.js) を読むと状態の中心が見える

### 「認証はどう動く？」

- [../src/firebase.js](../src/firebase.js)
- [../src/composables/useAuth.js](../src/composables/useAuth.js)
- [../src/utils/authCookie.js](../src/utils/authCookie.js)

### 「ノートはどこに保存される？」

- [../src/repositories/notesRepository.js](../src/repositories/notesRepository.js)
- [../src/constrants/firestore.js](../src/constrants/firestore.js)
- [../src/store/notes.js](../src/store/notes.js)

### 「UI のどこが編集画面と一覧画面を分けている？」

- [../src/App.vue](../src/App.vue)
- [../src/components/SidebarPane.vue](../src/components/SidebarPane.vue)
- [../src/components/EditorPane.vue](../src/components/EditorPane.vue)

## 9. まとめ

WebNote は、「認証 → Firestore 同期 → Pinia store 利用 → UI 反映」という順で構成された、比較的シンプルな Vue + Firebase アプリです。実装の中心は [../src/store/notes.js](../src/store/notes.js) と [../src/repositories/notesRepository.js](../src/repositories/notesRepository.js) であり、質問の入口としてはこの 2 箇所を最初に見ると全体像を掴みやすいです。

> このドキュメントは現在の実装に基づいて整理した起点資料です。実装が変わったら、対応する説明も更新することを推奨します。
