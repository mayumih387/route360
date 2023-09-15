---
title: Reactのフォームで、メールアドレス・NGワード・IPで送信不可にする
tags:
  - react
date: 2023-09-15
lastmod: 2023-09-15
---

Reactで作ったフロントエンドの問い合わせフォームで、任意のメールアドレスや特定の文言で送信できないようにする方法です。

私は[getForm](https://getform.io/)や[formspree](https://formspree.io/)などをバックエンドに使うことが多いですが、リッチなフォームプラグインと違い、それらにはスパム以外の任意の要素で問い合わせをブロックする機能がついていません。

そのため、今回はローカルにメールアドレスやNGワードのブラックリストを用意し、

《リスト内に一致するメールアドレスや文言が入力されている場合は送信ボタンを初期状態の`disabled`（無効）のままとする》

という方法で対応しました。

動作環境

- React 18.2.0

## ファイル構成

```tree
src/
├─ components/
│    └─ Form.js
├─ lib/
│    └─ blackList.js
```

## 特定のメールアドレスをブロック

ここではメールアドレスのブラックリストを例に、ごく簡単に書いています。

### コード

<div class="filename">src/components/Form.js</div>

```js
import React, { useState } from "react"
import { blackEmails } from "../lib/blackList"

const Form = () => {
  const [emailIsValid, setEmailIsValid] = useState(false)

  const enableSubmit = emailIsValid

  const emailChangeHandler = (event) => {
    setEmailIsValid(
      !blackEmails.some((email) => event.target.value.includes(email))
    )
  }

  return (
    <form>
      <label htmlFor="email">メールアドレス</label>
      <input type="email" id="email" onChange={emailChangeHandler} />
      <button type="submit" disabled={!enableSubmit}>
        送信
      </button>
    </form>
  )
}
```

<div class="filename">src/lib/blackList.js</div>

```js
export const blackEmails = ["aaa@example.com", "@test.com"]
```

### コードの解説

ブラックリストをフォームコンポーネント内でインポートし、入力されたメールアドレスがブラックリストに含まれない場合のみ、`enableSubmit`を`true`にします。

ブラックリストに含まるのかどうかは、javascriptの`includes()`メソッドを利用しています。

リンク - [Array.prototype.includes() - JavaScript | MDN](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)

## textareaへのNGワードをブロック

`<textarea>`内で、NGワードが含まれない場合のみに送信可能にするアレンジを追加してみます。

### コード

<div class="filename">src/components/Form.js</div>

```js
import React, { useState } from "react"
import { blackEmails, blackWords } from "../lib/blackList"

const Form = () => {
  const [emailIsValid, setEmailIsValid] = useState(false)
  const [textIsValid, setTextIsValid] = useState(false)

  const enableSubmit = emailIsValid && textIsValid

  const emailChangeHandler = (event) => {
    setEmailIsValid(
      !blackEmails.some((email) => event.target.value.includes(email))
    )
  }

  const textChangeHandler = (event) => {
    setTextIsValid(
      !blackWords.some((word) => event.target.value.includes(word))
    )
  }

  return (
    <form>
      <label htmlFor="email">メールアドレス</label>
      <input type="email" id="email" onChange={emailChangeHandler} />
      <label htmlFor="text">メッセージ</label>
      <textarea id="text" onChange={textChangeHandler} />
      <button type="submit" disabled={!enableSubmit}>
        送信
      </button>
    </form>
  )
}
```

<div class="filename">src/lib/blackList.js</div>

```js
export const blackEmails = ["aaa@example.com", "@test.com"]

export const blackWords = ["お前の", "母ちゃん", "でべそ"]
```

## IPアドレスでブロック

[ReactでIPアドレスを取得する方法](../get-ip-react/)を使って、IPアドレスでもブロックできます。

Reactで閲覧者のIPアドレスを取得するため、初回レンダリングの際に1回だけIP取得用のAPIに接続します。そのため、このケースでは`useEffect`を使います。

### コード

<div class="filename">src/components/Form.js</div>

```js
import React, { useState, useEffect } from "react"
import { blackEmails, blackIps } from "../lib/blackList"

const Form = () => {
  const [emailIsValid, setEmailIsValid] = useState(false)
  // 初期状態は空の定数`ip`を用意
  const [ip, setIp] = useState()

  const ipIsValid =
    ip && !blackIps.some((ip) => event.target.value.includes(ip))

  const enableSubmit = emailIsValid && ipIsValid

  const emailChangeHandler = (event) => {
    setEmailIsValid(
      !blackEmails.some((email) => event.target.value.includes(email))
    )
  }

  const getIp = async () => {
    // fetchを使ってipapi.coに接続
    const response = await fetch("https://ipapi.co/json/")
    const data = await response.json()
    // 取得したIPアドレスを、定数`ip`にセット
    setIp(data.ip)
  }

  // 関数`getIP`を初回レンダリングでのみ発動させる
  useEffect(() => {
    getIp()
  }, [])

  return (
    <form>
      <label htmlFor="email">メールアドレス</label>
      <input type="email" id="email" onChange={emailChangeHandler} />
      <button type="submit" disabled={!enableSubmit}>
        送信
      </button>
    </form>
  )
}
```

<div class="filename">src/lib/blackList.js</div>

```js
export const blackEmails = ["aaa@example.com", "@test.com"]

export const blackIps = ["123.456.789.01", "234.567.890.12"]
```

IP取得用のAPIは、上の例では登録不要のipapi.coに接続していますが、もちろん他のAPIでもかまいません。別のAPIの場合は返り値が多少異なる場合があるので、その辺は調整してください。

また、初回レンダリング時にIPを取得すると、ページがロードされる度にIP取得の回数を消費してしまうため、実際の場面では「reCaptchaチャレンジ通過時にIP取得」等にするといいでしょう。

以上です。
