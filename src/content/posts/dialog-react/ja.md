---
title: dialog要素を使ってReactでモーダルウィンドウを作る方法
tags:
  - react
date: 2023-06-20
lastmod: 2023-06-20
draft: false
---

最近はHTML要素とCSSのみで、javascript的な効果を演出することが可能になってきましたね。

今回は`<dialog>`要素を、モーダルウィンドウとしてReactで表示・非表示させる方法を紹介します。

Reactではモーダルウィンドウを表示・非表示させる場合、`useState`を使って状態を管理するのがセオリーでした。

`<dialog>`に置き換えることで`useState`が不要になり、状態管理を1つ減らすことができますし、モーダルウィンドウ用コンポーネントも不要になります。

動作環境

- React v18.2.0

## コード

```js
import React, { useRef } from "React"

const Dialog = () => {
  const dialog = useRef()

  const openHandler = () => {
    dialog.current.showModal()
  }

  const closeHandler = () => {
    dialog.current.close()
  }

  return (
    <>
      <dialog ref={dialog}>
        <p>ダイアログです。</p>
        <button onClick={closeHandler} type="button">
          閉じる
        </button>
      </dialog>
      <button type="button" onClick={openHandler}>
        ダイアログを表示
      </button>
    </>
  )
}

export default Dialog
```

## ポイント

- `useRef()`でダイアログ要素を取得して操作
- 背景を暗くしたい場合は、`::backdrop`疑似要素を使ってCSSでスタイリングする

先ほどの例ではボタンを表示用スイッチ（ハンドラー）として作りましたが、たとえばフォームの送信後に`onSubmit`を使って「送信しました」ダイアログを表示させてもいいと思います。

### フォーム送信後にダイアログを表示させる例

```js
import React, { useRef } from "React"

const Form = () => {
  const dialog = useRef()

  const submitHandler = (event) => {
    event.preventDefault()
    // ...
    // フォームを送信するfetchなど
    // ...
    dialog.current.showModal()
  }

  const closeHandler = () => {
    dialog.current.close()
  }

  return (
    <>
      <dialog ref={dialog}>
        <p>お問い合わせを送信しました。</p>
        <button onClick={closeHandler} type="button">
          閉じる
        </button>
      </dialog>
      <form onSubmit={submitHandler}>
        <input type="text">
        <button type="submit" onClick={submitHandler}>
          送信
        </button>
      </form>
    </>
  )
}

export default Form
```

フォームの場合は`useState`を多く使うと思いますが、上のコードではダイアログの表示の例のために省いています。

同ページ内でダイアログを表示させれば、フォーム送信後のサンキューページも不要になります。

Dialogをコンポーネント化して使う場合は、`ref`の操作は`forwardRef`を使います。

## Dialog要素のデメリット

実際にModalコンポーネントからdialog要素に変更してみて感じたデメリットは、dialog要素はReactによる表示・非表示に関係なく、最初からDOMツリーに含まれてしまう点です。

Stateで表示・非表示を制御するModalでは、初回にページがロードされた場合にModal内の要素はHTML内に読み子まれません。一方、dialog要素は見えなくてもHTMLに最初から組み込まれているため、dialog要素内のコンテンツが大きいと、ページの表示スピードに影響します。

dialog要素は、あくまでもアラート程度の内容に使うのが良いでしょうね。
