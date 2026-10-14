# Firebase Cloud Functions 第2世代でHello Worldを作成する

この手順では、既存のWebNoteリポジトリにFirebase Cloud Functions（第2世代）のHTTP関数を追加し、まずEmulator上で動作を確認します。Gemini APIへの接続やAPIキーの設定は行いません。

> **注意:** このHello Worldは認証のないHTTP関数です。デプロイするとURLを知る人が誰でも呼び出せます。まずEmulatorで確認し、デプロイする場合も本番ではなく開発用Firebaseプロジェクトを使ってください。

## 1. 前提条件

- Node.jsとnpmがインストールされている
- Firebase CLIが使える
- Emulator Suiteを使う場合、Java 11以上が使える
- デプロイする場合、開発用Firebaseプロジェクトがある

Functionsのランタイムとして選ぶNode.jsのバージョンは、初期化時にCLIが提示するサポート対象から選んでください。Cloud FunctionsのNode.jsランタイムは更新されるため、[ランタイムのサポート状況](https://firebase.google.com/docs/functions/manage-functions?gen=2#runtime_support)も確認してください。

Firebase CLIの確認:

```powershell
node --version
npm --version
firebase --version
```

Firebase CLIがまだインストールされていない場合は、[Firebase CLIの公式手順](https://firebase.google.com/docs/cli#install_the_firebase_cli)に従ってインストールします。npmを使う場合:

```powershell
npm install -g firebase-tools
```

## 2. Firebaseにログインし、プロジェクトを確認する

```powershell
firebase login
firebase projects:list
```

このリポジトリでは、現在のHosting先を不用意にFunctionsのデプロイ先にしないでください。ローカル確認にはEmulatorを使い、デプロイを試す必要がある場合は、別途用意した開発用Firebaseプロジェクトを指定します。

## 3. Functionsを初期化する

リポジトリのルート（`firebase.json`があるディレクトリ）で実行します。

```powershell
firebase init functions
```

対話式の質問では、次の方針で選びます。表示内容はFirebase CLIのバージョンによって多少異なる場合があります。

1. Functionsを設定するFirebaseプロジェクトを選ぶ。Emulatorだけを使う場合でも、実在する本番プロジェクトをデプロイ先として選ばないよう注意する
2. 言語は **JavaScript** を選ぶ
3. ESLintの設定はチームの方針に合わせる（迷う場合は初期値を維持する）
4. Functionsの依存パッケージをインストールする

初期化によって、通常は `functions/` 以下に関数のエントリーファイルと `package.json` が作られ、ルートの `firebase.json` にFunctionsのコードベース設定が追加されます。既存の `firebase.json` にはHosting設定があるため、初期化後もHosting設定が残っていることを確認してください。

## 4. Hello World関数を作成する

`functions/index.js` を開き、初期化で生成されたサンプル関数を、次のHTTP関数に置き換えます。

```js
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello World function was called");
  response.status(200).send("Hello from Firebase Functions!");
});
```

この関数はHTTP GET/POSTなどのリクエストを受け取り、HTTP 200と文字列を返します。後でGeminiプロキシを作る場合は、この公開HTTP関数をそのまま流用するのではなく、認証と入力検証を備えたCallable関数などを別途設計してください。

## 5. Functions Emulatorを初期化する

リポジトリのルートで実行します。

```powershell
firebase init emulators
```

選択画面では、今回は **Functions Emulator** を選びます。このHello Worldは認証を使わないHTTP関数なので、Authentication Emulatorはまだ必要ありません。Firebase Emulator Suiteの詳しい設定は[公式ガイド](https://firebase.google.com/docs/emulator-suite/install_and_configure)を参照してください。

## 6. Emulatorで実行する

開発用のデモプロジェクトIDを `demo-webnote` とする例です。実行時にプロジェクトIDを明示して、本番プロジェクトが選択されていても誤って接続しないようにします。

```powershell
firebase emulators:start --only functions --project demo-webnote
```

Emulatorが起動したら、別のPowerShellウィンドウから関数を呼び出します。

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:5001/web-note-904e2/us-central1/helloWorld"
```

成功すると次の応答が返ります。

```text
Hello from Firebase Functions!
```

関数のログはEmulatorを起動したウィンドウに表示されます。終了するときは、そのウィンドウで `Ctrl+C` を押します。Emulatorの既定ポートはFunctionsが `5001` です。ポートを変更している場合は、起動ログまたは `firebase.json` の設定に合わせてURLを変更してください。

`firebase emulators:start` は、初期化済みのEmulatorを起動します。HTTP関数をEmulatorで実行する詳しい手順は[Cloud Functions Emulatorの公式ガイド](https://firebase.google.com/docs/functions/local-emulator)を参照してください。

## 7. ブラウザーのAPIテストサーバーを使う（任意）

Emulatorまたはデプロイ済みのFunctions APIをブラウザーから確認できます。テストサーバーは`functions/`内で動作し、テスト対象のURLは画面で毎回入力します。

まず別のPowerShellウィンドウでFunctions Emulatorを起動します。

```powershell
firebase emulators:start --only functions --project demo-webnote
```

次に、リポジトリのルートからテストサーバーを起動します。

```powershell
npm --prefix functions run test-server
```

ブラウザーで `http://127.0.0.1:5179` を開き、Emulatorの関数URL、HTTP/Callableの形式、必要な本文を指定して送信します。Callable関数では本文欄に関数へ渡すJSON（例: `{"prompt":"こんにちは"}`）を入力すると、テストサーバーがCallable形式に包んで送信します。結果には対象関数のステータス、ヘッダー、本文、所要時間が表示されます。

テストサーバーは`127.0.0.1`だけで待ち受け、送信先をFunctions EmulatorまたはFirebase FunctionsのURLに制限します。入力内容は保存・ログ出力しません。認証情報は自動では付与しません。

## 8. 開発用Firebaseプロジェクトへデプロイする場合（任意）

Emulatorでの確認だけなら、この節は実行不要です。実際にクラウドへデプロイする場合は、先に開発用プロジェクトIDを確認し、そのIDを明示します。

```powershell
firebase deploy --only functions:helloWorld --project <開発用プロジェクトID>
```

デプロイ後、CLIに表示される関数URLへアクセスして応答を確認します。URLの形式はリージョンやCLI出力に従ってください。

> Cloud Functionsのデプロイには、通常Firebaseプロジェクトを従量課金制のBlazeプランにする必要があります。料金や現在の要件を[公式FAQ](https://firebase.google.com/docs/functions/faq-and-troubleshooting)で確認し、意図しない課金を避けるため、まずEmulatorでテストしてください。

## 完了条件

- EmulatorがFunctionsを起動し、`helloWorld` が登録されている
- HTTPリクエストに対して `Hello from Firebase Functions!` が返る
- 関数のログがEmulatorのターミナルに出る
- 本番Firebaseプロジェクトへ誤ってデプロイしていない

## 参考資料

- [Cloud Functions: はじめに（第2世代）](https://firebase.google.com/docs/functions/get-started?gen=2)
- [Cloud Functions Emulator](https://firebase.google.com/docs/functions/local-emulator)
- [Firebase Emulator Suiteのインストールと設定](https://firebase.google.com/docs/emulator-suite/install_and_configure)
- [Firebase CLI](https://firebase.google.com/docs/cli)
