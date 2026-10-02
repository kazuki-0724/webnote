# WebNote 補助ガイダンス

WebNote は Vue 3、Vite、Pinia、Firebase を使ったノート管理アプリです。この文書は実装に関する質問や変更の入口として、関連ファイルと現在のデータフローを示します。

## 起動・デプロイ

```bash
npm install
npm run dev
```

- `npm run build` で本番用ファイルを `dist/` に生成します。
- `npm run hosting:deploy` はビルドして Firebase Hosting にデプロイします。
- Firebase プロジェクトを指定する場合は `npm run hosting:deploy:project -- <project-id>` を使います。
- [README.md](../README.md) に Firebase Hosting の手順があります。

主な設定ファイル:

- [package.json](../package.json): npm scripts と依存関係
- [vite.config.js](../vite.config.js): Vue と SVG 用 Vite プラグイン
- [firebase.json](../firebase.json): `dist/` の Hosting 設定と SPA rewrite
- [src/firebase.js](../src/firebase.js): Firebase App、Auth、Firestore の初期化。Firebase 設定は `VITE_FIREBASE_*` 環境変数から読み込みます。

## 入口と責務

- [src/main.js](../src/main.js): Vue、Pinia、Vue Router を登録してアプリを起動し、WebMCP ツールを登録します。
- [src/App.vue](../src/App.vue): ルート画面の表示と認証初期化。
- [src/router/index.js](../src/router/index.js): `/auth`、`/login`、`/home`、`/whiteboard`、`/shared-viewer` のルートと認証ガード。
- [src/composables/useAuth.js](../src/composables/useAuth.js): Firebase Auth の状態、ログイン、ログアウト。
- [src/store/notes.js](../src/store/notes.js): ノート・フォルダ・選択状態、検索、共有、ホワイトボード操作。
- [src/repositories/notesRepository.js](../src/repositories/notesRepository.js): Firestore のノート取得・購読・作成・更新・削除。
- [src/repositories/folderRepository.js](../src/repositories/folderRepository.js): Firestore のフォルダ取得・購読・作成・更新・削除。
- [src/repositories/sharedRepository.js](../src/repositories/sharedRepository.js): 共有レコードの管理と共有ノートの取得。
- [src/components](../src/components): ログイン、ホーム、ノート編集、共有表示、ホワイトボードなどの画面・UI。
- [src/utils](../src/utils): ノート表示や共有トークンに関する処理。
- [src/webMCP.js](../src/webMCP.js): ノート操作・描画用 WebMCP ツール。`document.modelContext` が利用できる場合に登録します。

UI の主な入口は [src/components/Home.vue](../src/components/Home.vue)、[src/components/SidebarPane.vue](../src/components/SidebarPane.vue)、[src/components/ListPane.vue](../src/components/ListPane.vue)、[src/components/EditorPane.vue](../src/components/EditorPane.vue) です。ホワイトボードは [src/components/WhiteboardPage.vue](../src/components/WhiteboardPage.vue) と [src/components/WhiteboardCanvas.vue](../src/components/WhiteboardCanvas.vue) を確認してください。

## 現在のデータフロー

### 認証と画面遷移

1. `main.js` が Vue Router を登録し、`App.vue` が `useAuth().initializeAuth()` を呼びます。
2. `useAuth.js` が Firebase Auth の初期状態を待ち、認証状態の変化を購読します。
3. Router の認証ガードが未認証ユーザーを `/login` に送り、認証済みユーザーを `/home` に案内します。`/shared-viewer` は認証ガードを通さず表示できます。
4. Google ログインは [src/components/Login.vue](../src/components/Login.vue) から Firebase popup 認証を実行します。認証状態は Firebase Auth で管理されます。
5. [src/components/Home.vue](../src/components/Home.vue) がログイン済みユーザーの UID を使って `store.initNotesStore(uid)` を呼び、ノートとフォルダの購読を開始します。

### ノート・フォルダと Firestore

- ノートは `users/{uid}/notes`、フォルダは `users/{uid}/folders` に保存されます。保存先の参照はそれぞれ `notesRepository.js` と `folderRepository.js` にあります。
- 各 repository は `onSnapshot` で変更を購読し、Pinia store の `notes` / `folders` に反映します。
- 作成・削除などのノート操作は store から `notesRepository` に委譲します。タイトル・本文・ホワイトボードの更新は store で一時保留し、約 3 秒後にまとめて Firestore へ保存します。保留中の更新は `localStorage` に保持され、ページ離脱時などにも保存を試みます。
- フォルダの削除はフォルダ内のノートを削除してからフォルダを削除します。フォルダ名の変更・作成も `folderRepository` が Firestore に反映します。
- ホワイトボードはノートの `type` と `whiteboard` データとして保存されます。選択したノートがホワイトボードの場合は `/whiteboard` 画面を表示します。

### ノート共有

- 共有状態は Firestore の `shared/{shareToken}` レコードで管理され、レコードには UID とノート ID が保存されます。
- 共有 URL のトークン生成は [src/utils/shareToken.js](../src/utils/shareToken.js)、取得・更新は `sharedRepository.js` が担当します。
- 共有画面 [src/components/SharedViewer.vue](../src/components/SharedViewer.vue) は共有レコードからノートを取得し、ノート本文またはホワイトボードを表示します。

## 質問・変更内容から探す

- 起動、ビルド、デプロイ → [package.json](../package.json), [README.md](../README.md), [firebase.json](../firebase.json)
- Firebase 設定・認証 → [src/firebase.js](../src/firebase.js), [src/composables/useAuth.js](../src/composables/useAuth.js), [src/router/index.js](../src/router/index.js)
- ノートやフォルダの状態・操作 → [src/store/notes.js](../src/store/notes.js)
- Firestore のノート・フォルダ構造 → [src/repositories/notesRepository.js](../src/repositories/notesRepository.js), [src/repositories/folderRepository.js](../src/repositories/folderRepository.js)
- 共有 URL・表示 → [src/utils/shareToken.js](../src/utils/shareToken.js), [src/repositories/sharedRepository.js](../src/repositories/sharedRepository.js), [src/components/SharedViewer.vue](../src/components/SharedViewer.vue)
- ノート一覧・編集 UI → [src/components/Home.vue](../src/components/Home.vue), [src/components/SidebarPane.vue](../src/components/SidebarPane.vue), [src/components/ListPane.vue](../src/components/ListPane.vue), [src/components/EditorPane.vue](../src/components/EditorPane.vue)
- ホワイトボード・描画 → [src/components/WhiteboardPage.vue](../src/components/WhiteboardPage.vue), [src/components/WhiteboardCanvas.vue](../src/components/WhiteboardCanvas.vue), [src/store/notes.js](../src/store/notes.js)
- WebMCP → [src/webMCP.js](../src/webMCP.js), [src/main.js](../src/main.js)
- デザイン規約 → [doc/design-theme.md](design-theme.md)

## 保守時の注意

- Firestore のノート・フォルダパスは現在 repository 内で直接指定されています。[src/constrants/firestore.js](../src/constrants/firestore.js) は存在しますが、現在の repository からは参照されていません。保存先を変更するときは repository の実装を確認してください。
- [src/utils/authCookie.js](../src/utils/authCookie.js) は残っていますが、現行の認証フローでは参照されていません。認証状態は Firebase Auth を通じて管理されています。
- Firebase Hosting の SPA rewrite は [firebase.json](../firebase.json) にあります。クライアント側のルート追加時は [src/router/index.js](../src/router/index.js) も確認してください。
- 実装変更に伴い、この索引に記載したファイルの役割やデータフローも更新してください。
