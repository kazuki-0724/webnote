---
name: release-note
description: 'Generate release notes from git diff for WebNote. Use when creating a release summary, changelog page, or release-notes HTML from changed files. Uses fixed git diff commands that include unstaged tracked changes, updates release-notes/<timestamp>/index.html and the release-notes/index.html top page, and can validate placeholder replacement with a bundled script.'
argument-hint: '対象バージョン、補足したい概要'
user-invocable: true
---

# Release Note

git の差分から WebNote 向けのリリースノート HTML を作成し、一覧ページも更新するためのスキルです。

## When to Use
- リリース前に更新内容を HTML のリリースノートとしてまとめたいとき
- git diff をもとに、追加・変更・削除をファイル単位で整理したいとき
- release-notes 配下の詳細ページと一覧ページを同時に更新したいとき

## Inputs
- バージョン番号または表示名
- 必要なら全体概要の補足文

git の比較範囲は毎回手探りにせず、固定コマンドを使います。

## Resources
- 詳細ページ用テンプレート: [./templates/index.html](./templates/index.html)
- 一覧ページ用テンプレート: [./templates/top-index.html](./templates/top-index.html)
- 草案メモ: [./work.md](./work.md)
- 未置換チェック用スクリプト: [./scripts/check-release-note-placeholders.mjs](./scripts/check-release-note-placeholders.mjs)

## Procedure
1. 固定 git コマンドで差分ファイル一覧と差分本文を取得します。
2. 差分ファイルを追加・変更・削除の種類ごとに分類します。
3. 各ファイルについて、ファイル名、役割、差分要約を整理します。
4. 全体向けにバージョン、リリース日、概要をまとめます。
5. [./templates/index.html](./templates/index.html) をベースに、詳細ページの HTML を生成します。
6. [./templates/top-index.html](./templates/top-index.html) をベースに、一覧ページを更新します。
7. 生成した HTML を release-notes 配下の日時フォルダに配置します。
8. [./scripts/check-release-note-placeholders.mjs](./scripts/check-release-note-placeholders.mjs) を実行し、未置換プレースホルダーの有無だけを確認します。
9. スクリプト結果をそのまま共有し、未置換があっても追加作業は勝手に進めません。

## Detailed Rules

### 1. Diff Analysis
- 変更内容は必ず git diff に基づいて記述します。
- 差分取得コマンドは次の 2 つに固定します。
- `git diff --name-status HEAD -- . ':(exclude).github/**'`
- `git diff --find-renames --find-copies --unified=0 HEAD -- . ':(exclude).github/**'`
- これにより、HEAD 基準でステージ済みと未ステージ済みの tracked changes をまとめて取得します。
- 別の git コマンドに置き換えたり、都度解釈を変えたりしません。
- 事実として確認できない内容は書かず、必要なら「概要は推定を含む」と明示します。
- 差分が大きいファイルは、ユーザー影響のある変更を優先して要約します。

### 2. Required Fields
全体で埋める項目:
- {$version}
- {$release_date}

ファイルごとに埋める項目:
- {$file_name}
- {$file_description}
- {$addition}
- {$change}
- {$deletion}

### 3. Per-file Writing Rules
- {$file_name}: リポジトリ相対パスを使います。
- {$file_description}: そのファイルの責務を 1 文で説明します。
- {$addition}: 新規追加差分がある場合のみ、中身を要約して記載します。
- {$change}: 既存コードの修正がある場合のみ、中身を要約して記載します。
- {$deletion}: 削除差分がある場合のみ、中身を要約して記載します。
- 差分が存在しない種類は、空欄のままにするか、テンプレートに合わせて不要表示を避ける形で処理します。

### 4. Output Location
- 詳細ページは release-notes/<日時フォルダ>/index.html に配置します。
- 日時フォルダ名は既存運用があればそれに合わせます。
- 既存運用が不明な場合は、並び替えしやすい形式を使います。

### 5. Top Page Update
- release-notes/index.html はテンプレートベースで更新します。
- 新しいリリースノートへのリンクを追加します。
- 追加する内容には、少なくともバージョン、日付、概要を含めます。
- 既存の一覧構造や見た目は崩さず、最新リリースが分かるように更新します。

### 6. Placeholder Validation
- 未置換チェックは文字列検索スクリプトで行います。
- チェック対象は、生成物として確認したい HTML ファイルを明示的に指定します。
- スクリプトは `{$...}` 形式の残存文字列を列挙します。
- 未置換が見つかった場合も、その結果を共有するだけで追加修正は自動で行いません。

## Completion Checks
- 詳細ページが release-notes 配下の日時フォルダに生成されている
- release-notes/index.html から新しい詳細ページへ遷移できる
- {$version} と {$release_date} が置換されている
- 各差分ファイルに {$file_name} と {$file_description} が入っている
- 追加・変更・削除の要約が、git diff と矛盾していない
- HTML 内に未置換のプレースホルダーが残っていない

## Output
- release-notes/<日時フォルダ>/index.html
- 更新済みの release-notes/index.html
- 必要なら、どの git 範囲を採用したかの短いメモ
