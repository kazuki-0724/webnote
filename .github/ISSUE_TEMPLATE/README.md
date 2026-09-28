# GitHub Issue テンプレートの使い方

Cloud Agent に依頼する Issue は、GitHub の `Cloud Agent Task` テンプレートから作成します。

## 利用前の準備

テンプレートをリポジトリのデフォルトブランチへ push し、リポジトリで Issues が有効になっていることを確認してください。テンプレートの場所は `.github/ISSUE_TEMPLATE/cloud-agent-task.yml` です。

## Issue の作成と依頼

1. GitHub リポジトリの **Issues** を開き、**New issue** を選択します。
2. **Cloud Agent Task** の **Get started** を選び、フォームに入力します。
3. 目的、期待する動作と受け入れ条件、検証方法は必須です。現状と再現手順、関連領域、変更範囲、UI 条件は、該当する場合に記入してください。
4. **Submit new issue** で Issue を作成します。
5. Cloud Agent に実装を依頼する場合は、作成した Issue で Copilot を担当者に割り当てます。テンプレートから Issue を作成しただけでは、Cloud Agent は起動しません。

Copilot の割り当て操作や利用可否は、GitHub の画面、契約プラン、リポジトリまたは組織の設定によって異なる場合があります。

## 記入のポイント

- 受け入れ条件は、「何を操作すると、どうなるか」のように完了を判断できる形で書きます。
- 不具合の場合は、再現に必要な前提と手順、実際に起きることを記載します。
- 関連領域や対象ファイルが不明なら空欄で構いません。Cloud Agent がコードを確認して影響範囲を判断します。
- UI の変更では、画面サイズや表示条件なども記載してください。既存テーマは `doc/design-theme.md` を参照します。
- Cloud Agent は `doc/guidance.md` と関連コード・テストを確認して作業します。Issue に書いた対象候補は手掛かりとして扱い、実際の責務境界はコードに基づいて判断します。

## テンプレートが表示されない場合

- `.github/ISSUE_TEMPLATE/cloud-agent-task.yml` がデフォルトブランチに push されているか確認します。
- リポジトリの **Settings** で Issues が有効か確認します。
- Copilot を担当者に割り当てられない場合は、Cloud Agent の利用権限と組織・リポジトリのポリシーを確認します。