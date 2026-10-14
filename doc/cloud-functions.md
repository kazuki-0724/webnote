# Firebase Cloud Functions

この文書は、リポジトリに設定されている Cloud Functions の現状と、開発・Emulator・デプロイの手順をまとめます。Functions のソースは [functions/](../functions)、Firebase CLI の設定は [firebase.json](../firebase.json) にあります。

## 現在の構成

- Functions は第2世代の HTTPS 関数を使用します。
- エントリポイントは [functions/index.js](../functions/index.js) です。
- Functions の Node.js ランタイムは [functions/package.json](../functions/package.json) の `24` です。
- `firebase.json` の `predeploy` はデプロイ前に `npm --prefix "$RESOURCE_DIR" run lint` を実行します。
- Functions Emulator はポート `5001` で設定されています。

| 関数 | 種別 | 現在の動作 |
| --- | --- | --- |
| `helloWorld` | HTTP (`onRequest`) | 呼び出し時にログを記録し、`Hello from Firebase Functions!` を返す |
| `geminiAPI` | Callable (`onCall`) | `prompt` を検証し、Gemini `gemini-3.8-flash` に問い合わせて `{ text }` を返す |

`geminiAPI` は `GEMINI_API_KEY` を Firebase Secret Manager の secret として参照します。入力は空でない文字列、最大10,000文字です。現在、関数内の `request.auth` による認証チェックはコメントアウトされており、ログイン必須ではありません。利用を一般公開する前に、認証・利用制限・課金対策を検討してください。フロントエンドからこの Callable 関数を呼び出す実装も現時点では確認できません。

## 前提条件

- Node.js 24 と npm
- Firebase CLI（`firebase` コマンド）
- Emulator を使う場合は Java ランタイム
- デプロイ時は適切な Firebase プロジェクトと Cloud Functions の利用権限

プロジェクトの default は [`.firebaserc`](../.firebaserc) に設定されています。開発時は本番・共有プロジェクトを誤って使わないよう、Emulator と明示的な project ID を優先してください。

## ローカル lint

リポジトリのルートから実行します。

```powershell
npm --prefix functions install
npm --prefix functions run lint
```

依存関係がすでにインストール済みなら `install` は不要です。デプロイ時にも `firebase.json` の predeploy フックで lint が実行されます。

## Functions Emulator

Emulator Suite の設定はルートの [firebase.json](../firebase.json) にあります。デモ用 project ID を明示して起動します。

```powershell
firebase emulators:start --only functions --project demo-webnote
```

`helloWorld` は次の URL で確認できます。

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:5001/demo-webnote/us-central1/helloWorld"
```

期待される本文は `Hello from Firebase Functions!` です。実際の project ID やリージョンが異なる場合は、Emulator の起動ログに表示された URL に合わせてください。

`geminiAPI` を Emulator から実行するには Gemini API キーが必要です。Secret をローカルで安全に提供する Firebase Emulator の手順に従い、秘密値をソース管理へ追加しないでください。

## ブラウザー API テストサーバー（任意）

Functions の HTTP / Callable エンドポイントを手動で試すためのテスト画面があります。Emulator を起動した状態で別のターミナルから実行します。

```powershell
npm --prefix functions run test-server
```

`http://127.0.0.1:5179` を開き、Functions の URL と HTTP / Callable の形式、必要な本文を入力します。Callable の本文欄には関数に渡す JSON（例: `{"prompt":"こんにちは"}`）を指定します。

サーバーは `127.0.0.1` のみで待ち受け、Functions Emulator または Firebase Functions の URL に送信先を制限します。認証情報は自動付与されません。デプロイ済み関数へのテストは、公開範囲と料金に注意して行ってください。

## Secret の設定とデプロイ

`geminiAPI` をデプロイして利用する場合は、開発用 Firebase project に Secret を登録します。

```powershell
firebase functions:secrets:set GEMINI_API_KEY --project <開発用project-id>
```

CLI の指示に従って値を入力してください。Secret を `.env`、ソースコード、コミット対象ファイルへ書き込まないでください。設定後、対象 project ID を明示してデプロイします。

```powershell
firebase deploy --only functions --project <開発用project-id>
```

関数を限定してデプロイする場合:

```powershell
firebase deploy --only functions:helloWorld --project <開発用project-id>
firebase deploy --only functions:geminiAPI --project <開発用project-id>
```

Cloud Functions のデプロイには Firebase / Google Cloud 側のプラン、API、有効な権限などが必要です。利用条件と料金を確認し、意図しない本番デプロイや課金がないようにしてください。

## 関連ファイル

- [functions/index.js](../functions/index.js): HTTP / Callable 関数本体
- [functions/package.json](../functions/package.json): ランタイム、依存関係、lint / Emulator 関連 scripts
- [functions/test-server/server.js](../functions/test-server/server.js): API テストサーバー
- [firebase.json](../firebase.json): Functions source、lint predeploy、Emulator ポート
- [doc/cloud-functions-hello-world.md](./cloud-functions-hello-world.md): Emulator を使った Hello World の補足手順