# WebNote ガイダンス

このページは、リポジトリの質問や変更作業を始めるときの索引です。詳細な挙動はリンク先の実装と設定を確認してください。

## プロジェクト概要

WebNote は Vue 3 / Vite のノートアプリです。Pinia が画面状態を管理し、Firebase Authentication で Google ログイン、Cloud Firestore でユーザーごとのノート・フォルダを同期します。通常のノートに加え、ホワイトボードと共有閲覧ページがあります。

- 起動入口: [src/main.js](../src/main.js) → [src/App.vue](../src/App.vue) → [src/router/index.js](../src/router/index.js)
- 状態・操作の中心: [src/store/notes.js](../src/store/notes.js)
- Hosting と Functions の設定: [firebase.json](../firebase.json)
- 開発・デプロイの手順: [README.md](../README.md)、[doc/cloud-functions.md](./cloud-functions.md)

## 起動・ビルド・デプロイ

ルートで次のコマンドを使います。

```bash
npm install
npm run dev
npm run build
```

Firebase 接続には `src/firebase.js` が参照する `VITE_FIREBASE_API_KEY`、`VITE_FIREBASE_AUTH_DOMAIN`、`VITE_FIREBASE_PROJECT_ID`、`VITE_FIREBASE_STORAGE_BUCKET`、`VITE_FIREBASE_MESSAGING_SENDER_ID`、`VITE_FIREBASE_APP_ID` と `VITE_FIREBASE_MEASUREMENT_ID` を環境に設定します。値はリポジトリに追加しないでください。

- `npm run hosting:deploy`: ビルド後、Firebase CLI の現在の既定プロジェクトへ Hosting をデプロイします。
- `npm run hosting:deploy:project -- <project-id>`: 対象プロジェクトを明示して Hosting をデプロイします。
- 現在の `.firebaserc` の既定値は `web-note-904e2` です。デプロイ前に対象を確認してください。
- Hosting は `dist` を公開し、`firebase.json` の rewrite で SPA のすべてのパスを `index.html` に戻します。
- Cloud Functions は [doc/cloud-functions.md](./cloud-functions.md) を参照してください。

主な設定ファイル:

- [package.json](../package.json): フロントエンドの依存関係と npm scripts
- [vite.config.js](../vite.config.js): Vue と SVG ローダー
- [firebase.json](../firebase.json): Hosting、Functions、Emulator Suite の設定
- [functions/package.json](../functions/package.json): Functions の Node.js ランタイム、依存関係、scripts
- [index.html](../index.html): Vite の HTML エントリ

## リポジトリ構造と責務

| 場所 | 主な責務 |
| --- | --- |
| [src/main.js](../src/main.js) | Vue、Pinia、Router の初期化と WebMCP 登録 |
| [src/router/index.js](../src/router/index.js) | ルート定義とログイン必須ページのガード |
| [src/components/](../src/components) | ログイン、ホーム、編集、共有、ホワイトボードなどの画面 UI |
| [src/store/notes.js](../src/store/notes.js) | ノート・フォルダ状態、画面選択、編集、同期待ち更新、共有操作 |
| [src/repositories/](../src/repositories) | Firestore のノート・フォルダ・共有データの読み書き |
| [src/composables/useAuth.js](../src/composables/useAuth.js) | Firebase Auth のユーザー状態、初期化、ログイン・ログアウト |
| [src/firebase.js](../src/firebase.js) | 環境変数からの Firebase App / Auth / Firestore 初期化 |
| [src/utils/](../src/utils) | 認証 cookie helper、ノート表示 helper、共有トークン生成 |
| [src/webMCP.js](../src/webMCP.js) | 対応ブラウザーで登録するノート・ホワイトボード用 WebMCP ツール |
| [functions/](../functions) | Firebase Cloud Functions の実装と API テストサーバー |
| [doc/](.) | 開発・運用ガイド |
| [release-notes/](../release-notes) | リリースノート |

レイヤーの変更時は UI → Pinia store → repository → Firebase の境界を維持してください。Firebase 接続自体は [src/firebase.js](../src/firebase.js)、保存形式は各 repository が実装しています。

## 画面とルーティング

| パス | 画面 | アクセス |
| --- | --- | --- |
| `/auth` | 認証状態の確認後に `/home` または `/login` へ遷移 | 公開 |
| `/login` | Google ログイン | 公開 |
| `/home` | ノート一覧とエディター | ログイン必須 |
| `/whiteboard` | 選択中のホワイトボード | ログイン必須 |
| `/shared-viewer?id=...` | 共有ノートの閲覧 | ルーター上は公開 |

ルート定義とガードは [src/router/index.js](../src/router/index.js)、認証状態の初期化は [src/App.vue](../src/App.vue) と [src/composables/useAuth.js](../src/composables/useAuth.js) が担当します。共有ページの実データ可否は Firestore Security Rules にも依存しますが、そのルールファイルや Firebase 側設定はこのリポジトリでは確認できません。

## 主要データフロー

### 認証

1. [src/App.vue](../src/App.vue) が `initializeAuth()` を呼び出します。
2. [src/composables/useAuth.js](../src/composables/useAuth.js) が Firebase Auth の初期状態を待ち、`onAuthStateChanged` でユーザー状態を追います。
3. [src/router/index.js](../src/router/index.js) がログイン必須ページを `/auth` または `/login` へ誘導します。
4. [src/components/Home.vue](../src/components/Home.vue) が認証済みユーザーの UID で `initNotesStore()` を実行し、ノートとフォルダの購読を開始します。

`src/utils/authCookie.js` は存在しますが、現在の `useAuth.js` からは使用されていません。現在のログイン状態は Firebase Auth が管理しています。

### ノートとフォルダ

- ノート: [src/repositories/notesRepository.js](../src/repositories/notesRepository.js) が `users/{uid}/notes/{noteId}` を読み書きし、`onSnapshot` で一覧・個別ノートを監視します。
- フォルダ: [src/repositories/folderRepository.js](../src/repositories/folderRepository.js) が `users/{uid}/folders/{folderId}` を読み書きし、一覧を監視します。
- 操作や表示用状態は [src/store/notes.js](../src/store/notes.js) が集約し、画面コンポーネントが store の操作を呼びます。
- ノートのタイトル・本文・ホワイトボード更新は store 内でまとめられ、約3秒後に Firestore へ保存されます。未送信更新はユーザー別キーで `localStorage` に一時保存され、画面離脱などで flush されます。
- フォルダ削除は、そのフォルダに属するノートを削除してからフォルダを削除します。

`src/constrants/firestore.js` には `test_notes` / `test_note_folders` が残っていますが、現行 repository はこれらを参照せず、上記の UID 配下のパスを使用します。保存先を変更する場合は repository と Firestore Security Rules の整合を確認してください。

### 共有とホワイトボード

- 共有データは [src/repositories/sharedRepository.js](../src/repositories/sharedRepository.js) が `shared/{token}` にノート所有者 UID とノート ID を保存し、[src/components/SharedViewer.vue](../src/components/SharedViewer.vue) が共有ページを表示します。ノート本文はユーザー別ノートの snapshot から取得します。
- ホワイトボードはノートの `type: "whiteboard"` と `whiteboard` データ（キャンバス設定・ストローク）として通常のノートと同じ保存先に格納します。[src/components/WhiteboardPage.vue](../src/components/WhiteboardPage.vue) と [src/components/WhiteboardCanvas.vue](../src/components/WhiteboardCanvas.vue) が描画 UI を担当します。

## 変更時に最初に見るファイル

| 変更内容・質問 | 入口 |
| --- | --- |
| 開発起動、ビルド、Hosting デプロイ | [package.json](../package.json)、[README.md](../README.md)、[firebase.json](../firebase.json) |
| ログイン、ログアウト、ルートガード | [src/composables/useAuth.js](../src/composables/useAuth.js)、[src/router/index.js](../src/router/index.js)、[src/components/Login.vue](../src/components/Login.vue) |
| ノート・フォルダの状態や操作 | [src/store/notes.js](../src/store/notes.js) |
| Firestore のノート・フォルダ保存 | [src/repositories/notesRepository.js](../src/repositories/notesRepository.js)、[src/repositories/folderRepository.js](../src/repositories/folderRepository.js) |
| 共有リンクと閲覧 | [src/repositories/sharedRepository.js](../src/repositories/sharedRepository.js)、[src/utils/shareToken.js](../src/utils/shareToken.js)、[src/components/SharedViewer.vue](../src/components/SharedViewer.vue) |
| ノート一覧・本文編集 | [src/components/SidebarPane.vue](../src/components/SidebarPane.vue)、[src/components/EditorPane.vue](../src/components/EditorPane.vue) |
| ホワイトボード | [src/components/WhiteboardPage.vue](../src/components/WhiteboardPage.vue)、[src/components/WhiteboardCanvas.vue](../src/components/WhiteboardCanvas.vue)、[src/store/notes.js](../src/store/notes.js) |
| WebMCP | [src/webMCP.js](../src/webMCP.js)、[src/main.js](../src/main.js) |
| Cloud Functions / Gemini API | [functions/index.js](../functions/index.js)、[functions/package.json](../functions/package.json)、[doc/cloud-functions.md](./cloud-functions.md) |
| Firebase 環境変数 | [src/firebase.js](../src/firebase.js)、[vite.config.js](../vite.config.js) |

## 運用上の注意

- ルート `package.json` に test / lint script は定義されていません。Cloud Functions には `npm --prefix functions run lint` があり、デプロイ前フックでも実行されます。
- `functions/index.js` の `geminiAPI` は Callable 関数ですが、コード中の認証必須チェックはコメントアウトされています。現状、ログイン必須とは扱わず、公開・課金リスクを考慮して利用・デプロイしてください。
- `helloWorld` は HTTP 関数です。エンドポイントを知る人から呼び出せるため、必要性を確認してからデプロイしてください。
- [src/constrants/firestore.js](../src/constrants/firestore.js) は綴りを含めた既存パスであり、現状は古いコレクション名を持つ未参照ファイルです。削除・改名する場合は参照検索を先に行ってください。
- Firestore Security Rules、Firebase Console 側の Authentication / API / Secret 設定は、リポジトリ内だけでは確認できません。

## 関連ドキュメント

- [README.md](../README.md): アプリのローカル起動と Hosting デプロイ
- [cloud-functions.md](./cloud-functions.md): 現在の Cloud Functions、Emulator、デプロイ手順
- [cloud-functions-hello-world.md](./cloud-functions-hello-world.md): Functions Emulator を使った Hello World の手順。現在の関数構成は上記 `cloud-functions.md` を参照
