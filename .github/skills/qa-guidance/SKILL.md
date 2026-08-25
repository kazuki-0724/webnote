---
name: qa-guidance
description: "Use when a user asks about this WebNote repository: how it works, how to run it, how to deploy it, how a feature is implemented, where to change code, or how to debug a bug. Gives a fast repo-aware answer using the smallest relevant evidence and cites workspace files."
argument-hint: "質問内容（例: 起動方法, Firebase, 機能説明, バグ調査, 実装追加）"
user-invocable: true
---

# WebNote Q&A Guidance

このスキルは、WebNote に関する質問に対して、補助ドキュメントを起点にして効率よく回答するための手順を定義する。

## 目的
- まず [doc/guidance.md](../../doc/guidance.md) を参照して、全体像と重要な前提を把握する
- そのうえで、必要な個別ファイルを最小限参照し、質問に具体的に答える
- 誤った推測を避け、実装や設定に基づいて情報を整理する
- 補助ドキュメントに不足がある場合は、利用者にその旨を伝え、qa-docs の改善提案を促す

## 参照順序（必須）

### 1. まず guidance.md を参照する
- [doc/guidance.md](../../doc/guidance.md) を最初に確認する
- ここで大まかな構造、責務、技術スタック、主要なフローを把握する
- ここで把握した内容を前提に、追加で必要なファイルを絞って読む

### 2. 質問に応じて個別ファイルを参照する
- 実行方法や開発コマンド: [package.json](../../package.json), [README.md](../../README.md), [vite.config.js](../../vite.config.js)
- Firebase / Hosting: [firebase.json](../../firebase.json), [src/firebase.js](../../src/firebase.js)
- 認証の流れ: [src/composables/useAuth.js](../../src/composables/useAuth.js), [src/utils/authCookie.js](../../src/utils/authCookie.js)
- ノート管理: [src/store/notes.js](../../src/store/notes.js), [src/repositories/notesRepository.js](../../src/repositories/notesRepository.js), [src/repositories/folderRepository.js](../../src/repositories/folderRepository.js)
- 画面構成: [src/App.vue](../../src/App.vue), [src/components/SidebarPane.vue](../../src/components/SidebarPane.vue), [src/components/EditorPane.vue](../../src/components/EditorPane.vue)

### 3. 全体を検索対象にしない
- 最初からリポジトリ全体の横断検索を行わない
- 「guidance.md で全体像を確認したうえで、必要な箇所だけを深掘りする」ことを原則とする
- 質問に直接無関係なファイルを読む必要はない

## 判断フロー

### 1. 質問を分類する
- 実行方法・環境構築
- Firebase / Hosting / デプロイ
- 機能説明
- 実装箇所の確認
- バグや不具合の調査
- 改修方針の相談

### 2. guidance.md を起点にする
- 全体像を確認して、現状の責務と設計がどう分かれているかを理解する
- そのうえで、質問に関連する個別ファイルを確認する

### 3. 事実と推測を分ける
- 確認できた内容は根拠付きで答える
- 確認できていない内容は「doc/guidance.md では確認できていない」「該当ファイルでは確認できていない」と明示する
- 変更提案は依存関係と対象ファイルを確認してから出す

### 4. 回答は簡潔に整理する
- 最初に結論を 1 文で示す
- 次に補助ドキュメントと個別ファイルを根拠としてまとめる
- その後、必要に応じて修正候補や次の確認手順を示す

## 回答テンプレート

### 1. 結論
- 現象、設計、手順、原因候補を 1 文でまとめる

### 2. 補助ドキュメントの利用
- [doc/guidance.md](../../doc/guidance.md) を前提に説明したことを明記する
- 補助ドキュメントで何を把握したかを簡潔に記述する

### 3. 追加の根拠
- 必要な個別ファイルを参照して説明を補強する
- 参照ファイル名を明示する

### 4. 実施方針または修正候補
- 変更が必要なら対象ファイル名や変更方向を示す
- 実行コマンドや手順があるなら明記する

## 補助ドキュメント不足時のルール

### 1. 回答後に不足を確認する
- 回答が生成された後、補助ドキュメントに不足していると感じた場合は、その不足を明示する
- 例: 「doc/guidance.md では認証フローの詳細が足りない」「ノート管理のデータフローの項目が不足している」

### 2. ユーザーに改善提案を伝える
- 「qa-docs スキルの改善をおすすめします」と明確に伝える
- どこを追記すべきかを簡潔に示す

### 3. 推奨文言
- 「回答は作成できましたが、補助ドキュメントに不足が見えたため、qa-docs の更新を推奨します。」
- 「特に ○○ の説明を補足すると、今後の QA 精度が上がります。」

## 重要ルール
- 最初に [doc/guidance.md](../../doc/guidance.md) を参照する
- 最初からリポジトリ全体を参照対象にしない
- 参照は必要な箇所に限定する
- 根拠のある回答を行う
- 補助ドキュメント不足がある場合は、報告と改善提案を行う

## 完了チェック
- [doc/guidance.md](../../doc/guidance.md) を先に確認したか
- 追加で必要な個別ファイルを最小限確認したか
- 回答に根拠が含まれているか
- 補助ドキュメントの不足があればユーザーに伝えたか
- 質問に対する結論と次の一手が明確か

## 典型的な質問例
- WebNote はどう起動するの？
- Firebase Hosting にどうデプロイするの？
- 認証フローはどこで動いている？
- ノート保存処理はどこで行われている？
- この機能を追加するにはどこを触る？
- このバグの原因候補はどこ？

## 期待する成果物
- [doc/guidance.md](../../doc/guidance.md) を起点にした回答
- 必要な個別ファイル参照に基づく具体的な説明
- 補助ドキュメント不足がある場合の改善提案
- 実装や修正に使える具体的な候補と根拠
