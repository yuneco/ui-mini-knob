# Knob コンポーネント

`src/components/knob/Knob.tsx` で公開されるコントロール型ノブ UI。`value` を親側で保持し、ポインタ操作により `onChange` で値の更新を通知する。

## 外部 IF

### `<Knob />`（公開コンポーネント）

| Prop       | 型                        | デフォルト  | 説明                                            |
| ---------- | ------------------------- | ----------- | ----------------------------------------------- |
| `value`    | `number`                  | –           | 現在値。制御対象に必須。                        |
| `min`      | `number`                  | `0`         | 値の下限。ラベルにも使用。                      |
| `max`      | `number`                  | `100`       | 値の上限。ラベルにも使用。                      |
| `step`     | `number`                  | `1`         | 値の分解能。丸め・表示・ガイド目盛に反映。      |
| `onChange` | `(value: number) => void` | `undefined` | ポインタ操作で値が変化した際に発火。            |
| `disabled` | `boolean`                 | `false`     | ポインタ操作とガイド表示を無効化。              |
| `range`    | `number`                  | `135`       | 回転角（片側）。実際の可動域は `range * 2` 度。 |

### `<KnobUI />`（内部 UI レイヤー）

- 上記の props を受けて実際の描画とポインタイベントを処理。
- `onPointerEvent?: (event: KnobPointerData) => void` を経由してポインタ座標を親へ通知。

```21:49:src/components/knob/KnobUI.tsx
export interface KnobPointerData {
  x: number
  y: number
  dx: number
  dy: number
  angle: number
  distance: number
  tickStep: number
}
```

`KnobPointerData.tickStep` には現在の半径から算出された推奨ステップが入る。`Knob` 側では `getValueFromRelativePosition(dx, dy, min, max, tickStep, range)` に渡して新しい値を決定する。

## 機能

- **ポインタ操作による値入力**：ノブ中央をドラッグするとマウス位置を極座標へ変換し、角度を値へ射影。`step` 単位で丸め、`min`/`max` にクランプ。
- **差分ハイライト**：ドラッグ開始値と現在値のレンジを `getRanges` で算出し、ベース・差分・残り領域を異なる色 (`ACTIVE_COLOR` / `DIFF_COLOR_*` / `TRACK_COLOR`) でリング表示。
- **中央表示＆ラベル**：中央に `formatKnobValue` 後の値、左右に `min`/`max` を表示。`step` に応じて小数桁を自動決定。
- **ドラッグ中オーバーレイ**：ドラッグが開始されると `OverlayGuide` を表示し、値の推移・角度・目盛りを視覚化。マウスアップでクリーンアップ。
- **無効化状態**：`disabled` true でカーソルを `not-allowed` にし、イベントとオーバーレイを抑止。

## UI 表示・ガイド目盛仕様

### リング/本体

- 表示サイズは 64px 四方。内部リング半径は `size / 2 - 10`。
- `buildArcRendering` が `conic-gradient` を組み立て、12 時方向を基準に `range` で指定された角度のみを可動域として描画。
- RING マスク（`RING_STROKE_WIDTH=4`）でドーナツ状にくり抜き、ベース値＋差分値＋残余トラックを連続した弧として提示。

### OverlayGuide

- `OVERLAY_GUIDE_RADIUS=64` 以上の実効半径で、ドラッグ距離が近すぎる場合でも一定サイズ以上を確保。
- 固定配置 (`position: fixed`) の半透明ドーナツ背景と SVG レイヤーで構成。中心から値位置までの半径線・現在値マーカーを描く。
- `startValue` から `value` までの弧を ACTIVE / DIFF カラーで重ね、値の増減方向によって色を切り替える。
- 角度計算は `min`→`-range`、`max`→`+range`（上方向が 0 度）となる正規化角を利用。

### 目盛仕様

- `calculateTickStep` が実効半径と可動角度から弧長を計算し、最小目盛間隔 `4px` を満たすまで `step` を 2-5-10 系列で逓増。結果は `{ tickStep, majorTickStep }`。
- 目盛生成は `min` から `max` まで `tickStep` ごとにループし、`majorTickStep / tickStep` を整数化してインデックス判定。大目盛には `MAJOR_TICK_COLOR` と `strokeWidth=2`、小目盛は `#999` と `strokeWidth=1`。
- 大目盛には `formatTickLabel` で整形したラベルを付与。ラベルは半径 `actualRadius + 15` の位置に配置し、小数点以下は必要桁のみ表示。
- 目盛長：大目盛 12px、小目盛 8px。ノブとの距離は実効半径から各長さを差し引いた位置に内端を置く。
- `tickStep` に応じた値丸めが `onPointerEvent` 経由で渡されるため、UI 上の目盛と実際に選択できる値が同期する。

---

この README は `Knob` コンポーネントの仕様把握と実装追従のための要約ドキュメントとして利用する。
