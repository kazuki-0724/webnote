# WebNote

Vue 3 / Vite 製のノートアプリです。Google ログイン、Firestore へのノート・フォルダ保存、ホワイトボード、共有閲覧に対応しています。Firebase Hosting で配信します。

## ローカル開発

Node.js と npm を用意し、リポジトリのルートで実行します。

```bash
npm install
npm run dev
```

Firebase 接続用に `.env` などへ `VITE_FIREBASE_API_KEY`、`VITE_FIREBASE_AUTH_DOMAIN`、`VITE_FIREBASE_PROJECT_ID`、`VITE_FIREBASE_STORAGE_BUCKET`、`VITE_FIREBASE_MESSAGING_SENDER_ID`、`VITE_FIREBASE_APP_ID`、`VITE_FIREBASE_MEASUREMENT_ID` を設定してください。Firebase Console のプロジェクト設定に合わせ、値はコミットしないでください。

本番向けビルドは次のコマンドです。

```bash
npm run build
```

## Firebase Hosting デプロイ

Firebase CLI にログインし、対象プロジェクトを確認します。

```bash
npx firebase-tools login
npx firebase-tools projects:list
```

既定プロジェクトへビルドしてデプロイする場合:

```bash
npm run hosting:deploy
npx firebase-tools deploy --only hosting
```

現在の `.firebaserc` の既定 project ID は `web-note-904e2` です。別のプロジェクトを指定するときは、デプロイ前に ID を確認して次を実行します。

```bash
npm run hosting:deploy:project -- <project-id>
```

どちらのスクリプトも Vite ビルド後、Firebase Hosting のみをデプロイします。公開先は `firebase.json` の `dist`、SPA のパスは同ファイルの rewrite で `index.html` にフォールバックします。対象プロジェクトを必ず確認し、意図しない環境へのデプロイを避けてください。

## Cloud Functions

Functions の現行構成、Emulator、Secret、デプロイ手順は [doc/cloud-functions.md](doc/cloud-functions.md) を参照してください。フロントエンドの起動・Hosting デプロイと Functions のデプロイは別の手順です。
