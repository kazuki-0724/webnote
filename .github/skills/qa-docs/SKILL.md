---
name: qa-docs
description: "Use when a user needs a repository-aware answer for this WebNote project and the best practice is to create or update a helper document from the current codebase. This skill inspects the live repository, compares it with any existing documentation, and writes a support document covering the repo tree, responsibilities, architecture, workflows, and operational notes."
argument-hint: "新規作成／更新のどちらを行いますか？"
user-invocable: true
---

# QA Documentation Builder

このスキルは、WebNote の現状をリポジトリ内の実態に基づいて確認し、補助ドキュメントを作成または更新するためのワークフローです。

## 目的
- 現在のリポジトリ状態を正確に把握する
- 補助ドキュメントを作成または更新する
- すでに存在するドキュメントを、今の実態と照合して最新化する
- 質問に対して、推測ではなく実装と設定に基づいて回答する

## 主要なゴール
- ファイルツリー構造の整理
- 各ファイルやディレクトリの責務の説明
- アーキテクチャの整理
- 依存関係とデータフローの要約
- 実行・デプロイ・拡張に必要な接点の整理
- qa-guidance が最初に参照できる「問答の索引」になるドキュメント化

## qa-guidance との前提関係
このスキルで生成・更新する補助ドキュメントは、単なる説明書ではなく、qa-guidance の最初の参照先として使うことを前提にする。

- 出力先は [doc/guidance.md](../../doc/guidance.md) とする
- ここには、質問にすぐ答えるために必要な「入口」「責務」「関連ファイル」「データフロー」が整理されていることが重要
- qa-guidance はまず guidance.md を読んで全体像を把握し、その後に必要最小限の個別ファイルを確認する
- したがって、guidance.md は「詳細な実装解説の総覧表」ではなく、「回答の起点になる要点の索引」として構成する

## 実行時の基本ルール
1. 現在のリポジトリを確認する
   - ルートの設定ファイルを確認する
   - 主要ディレクトリを一覧化する
   - 重要なエントリポイントと依存関係を特定する
2. 既存の補助ドキュメントを確認する
   - `doc/` 配下
   - `.github/skills/` 配下
   - `README.md`
   - 関連するメモや運用資料
3. 既存ドキュメントがあれば、現在の実態との差分を見て更新する
   - 追記ではなく、現状と齟齬のない形に整える
   - 古い前提や誤記は削除または更新する
4. ドキュメントがなければ、リポジトリ解説用の新規ファイルを作成する
5. 作成後は、内容が現状のコードと一致しているか確認する
6. 回答時には、根拠と対象ファイルを明示する

## 必須の出力内容
補助ドキュメントには、最低限次の項目を含めること。

- リポジトリ全体の概要
- ファイルツリー構造
- 各ファイルまたはディレクトリの責務
- アーキテクチャ
- 主要な依存関係
- 主要なデータフロー
- 実行方法または運用方法
- 変更が想定される箇所の観点
- qa-guidance が質問の入口として使える「キーワード → 関連ファイル」の一覧
- 重要な起点ファイルの一覧と、それぞれの役割
- 典型的な質問に対する回答の入口となる説明

## guidance.md に含めるべき情報（必須）
qa-guidance の効率性を高めるため、guidance.md には次の情報を含める。

### 1. プロジェクトの短い要約
- 何のアプリか
- どの技術で作られているか
- どこが中心の責務か

### 2. 入口と起動手順
- 開発時の起動コマンド
- デプロイ時のコマンド
- どのファイルが実行入口か
- 重要な設定ファイルとその用途

### 3. 主要な責務マップ
- ルートファイルとその役割
- src 配下の各ディレクトリの責務
- UI / store / repository / auth / util の責務分離

### 4. 典型的なデータフロー
- 認証フロー
- ノート作成・更新・削除の流れ
- フォルダ管理の流れ
- Firestore との同期方法

### 5. 質問別の参照先
- 「起動方法」→ [package.json](../../package.json), [README.md](../../README.md)
- 「Firebase」→ [firebase.json](../../firebase.json), [src/firebase.js](../../src/firebase.js)
- 「認証」→ [src/composables/useAuth.js](../../src/composables/useAuth.js), [src/utils/authCookie.js](../../src/utils/authCookie.js)
- 「ノート管理」→ [src/store/notes.js](../../src/store/notes.js), [src/repositories/notesRepository.js](../../src/repositories/notesRepository.js)
- 「UI」→ [src/App.vue](../../src/App.vue), [src/components/SidebarPane.vue](../../src/components/SidebarPane.vue), [src/components/EditorPane.vue](../../src/components/EditorPane.vue)

### 6. 変更時の注目箇所
- どこを触れば実装変更が効くか
- 新しい機能追加時の入口候補
- 関連する依存関係や副作用が起きやすい箇所

### 7. 未確認事項と注意点
- 実装で確認できなかった部分
- 環境依存や既知の制約
- 今後の保守で更新すべき箇所

## 追加で入れると有用な項目
以下の内容があると、開発者の理解を深めやすくなる。

- 技術スタックのまとめ
- 環境変数の使い方
- Firebase や Firestore の利用構成
- 認証の流れ
- ノートとフォルダの管理フロー
- 状態管理の役割
- UI コンポーネントの責務分離
- 拡張時の入口候補
- 既知の制約や注意点
- 実装上のパターンや命名規則

## 推奨ドキュメント構成

### 1. 概要
- このプロジェクトが何を目的としているか
- 主要なユーザー体験と背景
- qa-guidance がまず参照する前提を記載する

### 2. 技術スタック
- Vue 3 / Vite / Pinia / Firebase
- 主要ライブラリと役割
- 実行環境の前提

### 3. リポジトリ構造
- ルート構成
- 主要ディレクトリの説明
- 重要なファイル一覧

### 4. ファイル責務
- ファイルごとに 1 行から 3 行で責務を説明する
- 役割が曖昧なものは、用途と責務を分離して書く
- 「質問に答えるときに読むべきファイル」を明記する

### 5. アーキテクチャ
- 画面構成
- 認証の流れ
- ノート管理の流れ
- Firebase との接続方法
- どこで状態管理を行っているか

### 6. 典型フロー
- 起動フロー
- ログインフロー
- ノート作成・更新・削除の流れ
- フォルダ移動と検索の流れ

### 7. 質問対応の索引
- 質問の種類 → 参照すべきファイル
- 典型的な疑問とその回答入口
- 変更時に見始めるべき箇所

### 8. 運用メモ
- 開発コマンド
- デプロイ手順
- 環境依存の注意点
- 既存の運用ルール

### 9. 未確認事項
- 実装で確認できなかった部分
- 今後の調査候補

## 更新ポリシー
- 既存ドキュメントがある場合は、まず既存内容を確認してから更新する
- 既存の記述が実装と合わない場合は、現状に合わせて修正する
- 新規作成時は既存の補助資料を重複させず、1 つの中心ドキュメントに整理する
- ドキュメントは再利用しやすい粒度で、検索しやすい見出しにする
- guidance.md は qa-guidance の読みやすさを優先し、質問の入口がすぐ見える構成にする
- 「雑な全体説明」ではなく、「素早く回答するための要点索引」になるよう書く

## 実行時のチェックリスト
- リポジトリのトップレベル構造を確認したか
- 重要な設定ファイルを確認したか
- 主要なソースディレクトリと責務を把握したか
- 既存の補助ドキュメントがあるか確認したか
- 既存ドキュメントと現状の差分を確認したか
- guidance.md が qa-guidance の最初の参照先として使える構造になっているか
- 質問の入口・関連ファイル・典型フローが見つけやすいか
- 最低限の要件が満たされているか
- 推測ではなく実コードと設定を根拠にしているか

## 重要ルール
- 推測で回答しない
- 実際に存在するファイルとコードを見てから書く
- 既存のドキュメントがあれば更新優先、重複作成はしない
- 結論と根拠を分けて書く
- 不確実な情報は「未確認または要確認」と明記する

## 推奨対象ファイル
- [package.json](../../package.json)
- [firebase.json](../../firebase.json)
- [vite.config.js](../../vite.config.js)
- [src/App.vue](../../src/App.vue)
- [src/main.js](../../src/main.js)
- [src/firebase.js](../../src/firebase.js)
- [src/store/notes.js](../../src/store/notes.js)
- [src/repositories/notesRepository.js](../../src/repositories/notesRepository.js)
- [src/repositories/folderRepository.js](../../src/repositories/folderRepository.js)
- [src/composables/useAuth.js](../../src/composables/useAuth.js)
- [src/components/SidebarPane.vue](../../src/components/SidebarPane.vue)
- [src/components/EditorPane.vue](../../src/components/EditorPane.vue)

## 期待する成果物
- 現在のリポジトリに対応した補助ドキュメント
- 既存ドキュメントがある場合の更新版
- ファイル構成・責務・アーキテクチャが整理された文書
- 質問者が次に見るべきファイルが分かる説明
- qa-guidance が最初に確認し、必要な追加確認を最小限で済ませられる索引情報を含む文書
- 出力ファイル名は `guidance.md` として、出力先は `doc` 直下とする

## 組み込み方針
このスキルは、単なる質問回答の補助ではなく、リポジトリの理解を支える「文書生成専用の QA 支援スキル」として使う。
回答時にドキュメントを作成・更新する前提で動作し、実際のコードと設定に対して整合性を確認する。
また、生成された guidance.md は qa-guidance の初期参照先であり、質問に対する答えの入口として機能することを最優先にする。
