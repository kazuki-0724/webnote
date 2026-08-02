release-noteを作成するSKILL

gitの差分を利用して、リリースノートを作成する。
リリースノートはテンプレートとして`index.html`を利用する
作成した`index.html`は`release-notes`フォルダ配下の日時フォルダ配下に配置する。
TOPページとしての`release-notes/index.html`に作成した`index.html`へのパスを記載しつつ。概要も記載する。

埋めるべき項目は以下のみ

全体
- {$version}
- {$release_date}

ファイルごと
- {$file_name}
- {$file_description}
  
  差分種類に応じて採用
  - {$addition}
  - {$change}
  - {$deletion}

