# 追放王子とメイドちゃん

町の育成と横スクロール自動遠征を組み合わせるゲームの試作。

**[iPhone / ブラウザで遊ぶ（HTML試作）](https://cp-base.github.io/exiled-prince-and-maid/)**

現在のv0.6試作では、内政・発見→装備と仲間の編成→横スクロール自動遠征→帰還というループに、敵撃破時の装備ドロップと3人目の仲間を追加しました。近接キャラは敵の前まで一緒に移動して攻撃し、遠距離キャラは後方から独立して攻撃します。v0.5の村長の娘との交流・救出イベントも継続。ドロップ率・装備・仲間性能は試作用の仮仕様です。

## 案内

- [通常チャッピーの入口](Chappy.md) / [Codexの入口](AGENTS.md)
- [現在地](STATUS.md)：確認できていることと未決事項
- [共通ルールのひな型](docs/WORKING_RULES.md)：現在は未設定
- [判断の記録](DECISIONS.md)：現在は記入用のひな型

## 最新の改修記録
- [v0.6 装備ドロップ・仲間編成・近遠距離同時戦闘の実装記録](docs/V06_LOOT_PARTY_COMBAT.md)
- [v0.5 村長の娘と親密度イベントの実装記録](docs/V05_HEROINE_EVENTS.md)
- [v0.4 内政・発見・出撃分離の実装記録](docs/V04_IMPLEMENTATION.md)
- モックDOM試験：`node tests/v06_loot_party_combat.cjs`、`node tests/v05_heroine_smoke.cjs`、`node tests/v04_smoke.cjs`（Node.js、追加パッケージ不要）
