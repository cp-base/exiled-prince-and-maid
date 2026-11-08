# 追放王子とメイドちゃん

町の育成と横スクロール自動遠征を組み合わせるゲームの試作。

**[iPhone / ブラウザで遊ぶ（HTML試作）](https://cp-base.github.io/exiled-prince-and-maid/)**

現在のv0.9試作では、噂を確定装備ドロップから情報収集へ戻し、敵の装備ドロップ率を低くしてお金・共通素材を追加。町では行商人を呼んで簡単な武器購入と素材売却ができます。試走用1倍/4倍速を切り替えられます。v0.7までの内政、近遠距離の独立自動戦闘、仲間編成、村長の娘の救出・交流は維持。重要人物は村長の娘・村長・狩人トーマの3人。村長の信頼は町の発展や救出に反応し、トーマの足跡情報から特別な討伐遠征へ進めます。数値・商品・噂・討伐イベントは仮の試験用です。

## 案内

- [通常チャッピーの入口](Chappy.md) / [Codexの入口](AGENTS.md)
- [現在地](STATUS.md)：確認できていることと未決事項
- [共通ルールのひな型](docs/WORKING_RULES.md)：現在は未設定
- [判断の記録](DECISIONS.md)：現在は記入用のひな型

## 最新の改修記録
- [v0.9 村長・狩人トーマの友好度と討伐イベント](docs/V09_VILLAGE_RELATIONS.md)
- [v0.8 噂・通貨素材・行商人・試走4倍速の改修記録](docs/V08_ECONOMY_RUMOR_SPEED.md)
- [v0.7 ヒロイン救出ポップアップ・町限定仲間・ランダム提案](docs/V07_HEROINE_FLOW.md)
- [v0.6 装備ドロップ・仲間編成・近遠距離同時戦闘の実装記録](docs/V06_LOOT_PARTY_COMBAT.md)
- [v0.5 村長の娘と親密度イベントの実装記録](docs/V05_HEROINE_EVENTS.md)
- [v0.4 内政・発見・出撃分離の実装記録](docs/V04_IMPLEMENTATION.md)
- 最新テスト：`node tests/v09_village_relations.cjs`、`node tests/v08_economy_rumor_speed.cjs`、`node tests/v07_heroine_flow.cjs`
- 過去版の最新版のモックDOM試験：`node tests/v08_economy_rumor_speed.cjs`、`node tests/v07_heroine_flow.cjs`（Node.js、追加パッケージ不要）。
- 旧バージョンのテストは[tests/README](tests/README.md)参照。
- 履歴テスト：`node tests/v06_loot_party_combat.cjs`、`node tests/v05_heroine_smoke.cjs`、`node tests/v04_smoke.cjs`（Node.js、追加パッケージ不要）
