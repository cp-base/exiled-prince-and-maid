# 追放王子とメイドちゃん

町の育成と横スクロール自動遠征を組み合わせるゲームの試作。

**[iPhone / ブラウザで遊ぶ（HTML試作）](https://cp-base.github.io/exiled-prince-and-maid/)**

現在のv0.5試作では、メイドの内政提案を選び、ランダムな発見結果を確認してから装備を整えて出撃できます。二人の横スクロール自動遠征、噂からの装備発見、街道・工房の育成、灰渡の仮マップ目標も維持しています。村長の娘との出会い・交流・偶然の遭遇・遠征10体地点の救出と親密度履歴を追加しています。イベント確率・発見物・能力効果・人物描写は未確定の仮実装です。

## 案内

- [通常チャッピーの入口](Chappy.md) / [Codexの入口](AGENTS.md)
- [現在地](STATUS.md)：確認できていることと未決事項
- [共通ルールのひな型](docs/WORKING_RULES.md)：現在は未設定
- [判断の記録](DECISIONS.md)：現在は記入用のひな型

## 最新の改修記録
- [v0.5 村長の娘と親密度イベントの実装記録](docs/V05_HEROINE_EVENTS.md)
- [v0.4 内政・発見・出撃分離の実装記録](docs/V04_IMPLEMENTATION.md)
- モックDOM試験：`node tests/v05_heroine_smoke.cjs` と `node tests/v04_smoke.cjs`（Node.js、追加パッケージ不要）
