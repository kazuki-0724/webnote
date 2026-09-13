---
applyTo: "**/*.{js,vue,md,ts,json}"
---

# WebNote Pair Programming Instructions

## 1. 目的
このリポジトリでエージェントが作業する際は、コード生成だけでなく、設計判断・責務の整理・検証までを含むペアプログラミングの流れを守る。

## 2. 作業順序
1. 依頼の意図を要件として要約する
2. `doc/guidance.md` から関連箇所を確認する
3. 影響範囲を UI / store / repository / auth で切り分ける
4. 変更方針をユーザーに説明して合意を取る
5. 変更を最小限で適用する
6. 変更の妥当性を検証し、結果を説明する

## 3. 責務の境界
- UI 層: `src/App.vue`, `src/components/*`
- State 層: `src/store/notes.js`
- Repository 層: `src/repositories/*.js`
- Auth 層: `src/firebase.js`, `src/composables/useAuth.js`, `src/utils/authCookie.js`
- Utility 層: `src/utils/*.js`

UI が store の中身を直接操作するのではなく、store や repository に責務を委譲する。

## 4. 実装前に確認すること
- どのレイヤーに修正が必要か
- 既存のデータフローが壊れないか
- Firestore のコレクション構造や UI の表示条件に影響があるか
- 既存のデザインテーマとの整合性

## 5. 実装時のルール
- 既存の命名規則とファイル分割を踏襲する
- 仕様変更がある場合は、最小変更で対応する
- 1 つの修正で複数の責務を混ぜない
- 関連するテストや build を確認する

## 6. UI/デザイン確認
- 色や背景、角丸、余白の感覚は `doc/design-theme.md` に従う
- `slate` / `sky` 系を優先し、暗色・派手なトーンを避ける
- 既存コンポーネントの雰囲気に合わせて微調整する

## 7. 確認プロセス
作業の前後で次を明確にする。

- 何を変えるか
- なぜその場所か
- どの検証で確認するか
- エラー時のフォールバックは何か

## 8. 最終報告
変更後は、次を簡潔に報告する。

- 変更した範囲
- なぜその場所が適切か
- 検証結果
- もし残る懸念があれば、それを明示する
