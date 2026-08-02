# webnote

## Firebase Hosting デプロイ

このプロジェクトは Vite なので、ビルド成果物 `dist` を Hosting へ配置します。

### 1. Firebase にログイン

```bash
npx firebase-tools login
```

### 2. デプロイ先プロジェクトIDを確認

```bash
npx firebase-tools projects:list
```

### 3. ビルド + デプロイ

プロジェクトIDを指定して実行します。

```bash
npm run build
npx firebase-tools deploy --only hosting --project web-note-904e2
```

または、スクリプト経由でも実行できます。

```bash
npm run hosting:deploy
```

### 4. SPA ルーティング

`firebase.json` に `rewrites` を設定済みなので、リロード時も `index.html` へフォールバックされます。
