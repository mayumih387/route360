---
title: Reactでツールチップのコンポーネントを作る方法
tags:
  - react
date: 2022-09-27T06:38:14.024Z
lastmod: 2022-12-12T03:39:44.029Z
draft: true
---

React でツールチップを作る方法です。

UI コンポーネントやライブラリ等を使う方が多いかもしれませんが、私は変に色々なものをインストールしたくないので、単純な機能であれば自前で作ってしまいたい派です。

- [デモ](https://starlit-lollipop-635291.netlify.app/demo/tooltip-demo)
- [コード（GitHub）](https://github.com/mayumih387/demo-nextjs/blob/main/pages/demo/tooltip-demo.js)

今回使う React Hook は、`useState()`です。

## ツールチップを表示するためにクリックする要素（ボタン）を作る

ツールチップはコンポーネントとして作るため、コンポーネント用フォルダーに Tooltip.js を作成。

<div class="filename">/component/Tooltip.js</div>

```js
export default function Tooltip(props) {
  return (
    <>
      <button type="button">{props.buttonName}</button>
      {/* tooltip itself */}
      <div>{props.children}</div>
    </>
  )
}
```

今回はクリック可能な要素が必要となるため、`<button>`を使います。

※`<div>`等はクリック可能要素ではなく、アクセシビリティ（利用のしやすさ）の観点から推奨されません。見た目はあとで CSS でいくらでも変更できるので、大人しく`<button>`を使いましょう。

ページ毎でツールチップの中身やボタン名は使う場所で自由に変えられるようにするため、`props`でデータを受け取って自由に表示内容が変えられるようにします。

ここでは、`buttonName`としてボタン名を、`children`としてツールチップの中身を受け取るようにしています。

## 作ったボタンをフロントエンドに表示させる

今回の[デモ](https://starlit-lollipop-635291.netlify.app/demo/tooltip-demo)は Next.js 上に作っているので、デモページは`/pages/demo/`フォルダー内に作成しています。

Gatsby.js 等の他のライブラリや通常の React アプリの場合は、適宜変更してください。

<div class="filename">/pages/demo/tooltip-demo.js</div>

```js
import Tooltip from "../../components/Tooltip"

export default function TooltipDemo() {
  return <Tooltip buttonName="I am a button!">I am inside Tooltip!</Tooltip>
}
```

先ほど作ったツールチップコンポーネントにデータを渡すため、`<Tooltip>`内に`buttonName`プロパティを、ツールチップ内の表示内容として「`I am inside Tooltip!`」を記載しました。

このようにして、ツールチップコンポーネント側で`props`を通して、それぞれのデータを受け取ります。

この時点では、ボタンもツールチップの中身も同時に表示されています。

## ツールチップ部分に、表示・非表示のためのステート（状態）を追加

最初に作ったツールチップコンポーネントのツールチップ部分に、`useState()`を使って、表示・非表示の状態（state）を追加します。

`tooltipIsOpen`は初期状態が非表示（`false`）です。「`true`に変わった時のみ表示」となるようにします。

<div class="filename">/component/Tooltip.js</div>

```js
import { useState } from "react"

export default function Tooltip(props) {
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false)

  return (
    <>
      <button type="button">{props.buttonName}</button>
      {/* tooltip itself */}
      {tooltipIsOpen && <div>{props.children}</div>}
    </>
  )
}
```

Gatsby.js などの場合、「React をインポートせよ」というエラーが出る場合があります。その場合は上記の最初の行を

```js
import React, { useState } from "react"
```

として、React をインポートするようにしてください。

試しに`useState`の初期状態を`true`にしたり`false`にしてみたりしてください。ツールチップの表示・非表示が変われば、`useState`の設定は成功です。

## ボタンを押したときにツールチップを表示・非表示させるハンドラ（関数）を作る

ツールチップコンポーネントのボタンに、クリック時にツールチップを表示させるようにハンドラをつけます。

<div class="filename">/component/Tooltip.js</div>

```js
import { useState } from 'react'

export default function Tooltip(props) {
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false)

  const tooltipHandler = () => {
    setTooltipIsOpen((prevState) => !prevState)
  }

  return (
    <>
      <button
        onClick={tooltipHandler}
        type="button"
      >{props.buttonName}</button>
      {/* tooltip itself */}
      {tooltipIsOpen && <div>{props.children}</div>}
    <>
  )
}
```

ボタンに追加した`onClick`で、ハンドラ`tooltipHandler`が発火するようにします。

その`tooltipHandler`は、`tooltipIsOpen`が`false`の状態ならば`true`に、`true`の状態なら`false`になるような関数です。

ボタンを何度かクリックして確かめてみてください。ツールチップが表示・非表示と繰り返されれば成功です。

## ツールチップ表示中に画面上クリックでツールチップを非表示にするハンドラ（関数）を追加する

ボタン以外の場所をクリックしたり操作した時にも、ツールチップ表示を解除（非表示に）できるといいですよね。

この場合は、ボタン要素に`onBlur`とハンドラを追加して、フォーカスが外れた時にツールチップが消える（`tooltipIsOpen`を`false`にする）ようにします。

<div class="filename">/component/Tooltip.js</div>

```js
import { useState } from "react"

export default function Tooltip(props) {
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false)

  const tooltipHandler = () => {
    setTooltipIsOpen(prevState => !prevState)
  }

  const closeTooltipHandler = () => {
    setTooltipIsOpen(false)
  }

  return (
    <>
      <button
        onClick={tooltipHandler}
        onBlur={closeTooltipHandler}
        type="button"
      >
        {props.buttonName}
      </button>
      {/* tooltip itself */}
      {tooltipIsOpen && <div>{props.children}</div>}
    </>
  )
}
```

単純に`setTooltipIsOpen(false)`とするだけなので、簡単ですね。

## CSS で見栄えを整える

今回は CSS モジュールでスタイルを整えます。便宜的に同じ component フォルダーに入れましたが、styles フォルダがあればそちらに入れても良しです。

以下のスタイリングは最低限の内容の例なので、適宜アレンジしてください。

```css
/* /component/Tooltip.module.css */

.tooltipButton {
  position: relative;
}

.tooltip {
  position: absolute;
  top: 2em;
  left: 1em;
  background: #fff;
  margin-top: 0.75rem;
  padding: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
  z-index: 10;
  color: #000;
}

.tooltip::before {
  content: "";
  position: absolute;
  top: -30px;
  left: 50%;
  margin-left: -15px;
  border: 15px solid transparent;
  border-bottom: 15px solid #fff;
}
```

上記で作った CSS モジュールを、コンポーネント内で読み込みます。

<div class="filename">/component/Tooltip.js</div>

```js
import styles from "../components/Tooltip.module.css"

export default function Tooltip(props) {
  //...(略)
}
```

これで完成です。

## コードまとめ

※CSS（Tooltip.module.css）は先ほどの内容を参照ください。

<div class="filename">/component/Tooltip.js</div>

```js
import { useState } from "react"
import styles from "../components/Tooltip.module.css"

export default function Tooltip(props) {
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false)

  const tooltipHandler = () => {
    setTooltipIsOpen(prevState => !prevState)
  }
  const closeTooltipHandler = () => {
    setTooltipIsOpen(false)
  }

  return (
    <>
      <button
        className={styles.tooltipButton}
        onClick={tooltipHandler}
        onBlur={closeTooltipHandler}
        type="button"
      >
        {props.buttonName}
      </button>
      {/* tooltip itself */}
      {tooltipIsOpen && <div className={styles.tooltip}>{props.children}</div>}
    </>
  )
}
```

<div class="filename">/pages/demo/tooltip-demo.js</div>

```js
import Tooltip from "../../components/Tooltip"

export default function TooltipDemo() {
  return <Tooltip buttonName="I am a button!">I am inside Tooltip!</Tooltip>
}
```

比較的シンプルなコードで作れるので、React の理解を確かめるにはちょうど良い練習になると思います。
