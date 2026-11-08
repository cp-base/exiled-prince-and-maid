# 追放王子とメイドちゃん

町の育成と横スクロール自動遠征を組み合わせるゲームの試作。

**[iPhone / ブラウザで遊ぶ（HTML試作）](https://cp-base.github.io/exiled-prince-and-maid/)**

現在のv0.7試作では、内政・発見→装備と仲間の編成→横スクロール自動遠征→帰還というループに、敵撃破時の装備ドロップと3人目の仲間を追加しました。近接キャラは敵の前まで一緒に移動して攻撃し、遠距離キャラは後方から独立して攻撃します。村長の娘は初回交流後に10体目で救出でき、ポップアップを経て灰渡限定の仲間として編成できます。以後の交流は帰還時のランダムイベントになり、メイドの提案も抽選式です。ドロップ率・装備・仲間性能は試作用の仮仕様です。

## 案内

- [通常チャッピーの入口](Chappy.md) / [Codexの入口](AGENTS.md)
- [現在地](STATUS.md)：確認できていることと未決事項
- [共通ルールのひな型](docs/WORKING_RULES.md)：現在は未設定
- [判断の記録](DECISIONS.md)：現在は記入用のひな型

## 最新の改修記録
- [v0.7 ヒロイン救出ポップアップ・町限定仲間・ランダム提案](docs/V07_HEROINE_FLOW.md)
- [v0.6 装備ドロップ・仲間編成・近遠距離同時戦闘の実装記録](docs/V06_LOOT_PARTY_COMBAT.md)
- [v0.5 村長の娘と親密度イベントの実装記録](docs/V05_HEROINE_EVENTS.md)
- [v0.4 内政・発見・出撃分離の実装記録](docs/V04_IMPLEMENTATION.md)
- 最新テスト：`node tests/v07_heroine_flow.cjs`（過去バージョン専用のテストは変更前の仕様を検証します）
- 過去版のモックDOM試験：`node tests/v06_loot_party_combat.cjs`、`node tests/v05_heroine_smoke.cjs`、`node tests/v04_smoke.cjs`（Node.js、追加パッケージ不要）
