---
title: Reactのフォームで、メールアドレスのブラックリストを適用させる
tags:
  - react
date: 2023-08-17
lastmod: 2023-08-22
draft: true
---

Reactで作ったフロントエンドの問い合わせフォームで、任意のメールアドレスや文言で送信できないようにする方法です。

私はgetFormやformspreeなどをバックエンドに使うことが多いですが、それらではリッチなフォームプラグインと違い、スパム以外の任意の要素で問い合わせをブロックする機能を

そのため、今回はローカルにメールアドレスのブラックリストを用意し、リスト内に一致するメールアドレスや文言が入力されている場合は送信ボタンを初期状態の`disabled`（無効）のままとする方法で対応しました。

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

## コード

ここではメールアドレスのブラックリストを例に、ごく簡単に書いています。

<div class="filename">src/components/Form.js</div>

```js
import React, { useState } from "react"
import { blackEmails } from "../lib/blackList"

const Form = () => {
  const [emailIsValid, setEmailIsValid] = useState(false)

  const enableSubmit = emailIsValid

  const emailChangeHandler = event => {
    setEmailIsValid(!blackEmails.includes(event.target.value))
  }

  return (
    <form>
      <label htmlFor="email">メールアドレス</label>
      <input
        type="email"
        id="email"
        onChange={emailChangeHandler}
      />
      <button
        type="submit"
        disabled={!enableSubmit}
      >
        送信
      </button>
    </form>
  )
}
```

<div class="filename">src/lib/blackList.js</div>

```js
export const blackEmails = ["aaa@example.com", "bbb@example.com"]
```

## コードの解説

ブラックリストをフォームコンポーネント内でインポートし、入力されたメールアドレスがブラックリストに含まれない場合のみ、`enableSubmit`を`true`にします。

ブラックリストに含まるのかどうかは、javascriptの`includes()`メソッドを利用しています。

リンク - [Array.prototype.includes() - JavaScript | MDN](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)

## アレンジ

### textareaへの入力で判定

`<textarea>`内で、NGワードが含まれない場合のみに送信可能にするアレンジを追加してみます。

<div class="filename">src/components/Form.js</div>

```js
import React, { useState } from "react"
import { blackEmails, blackWords } from "../lib/blackList"

const Form = () => {
  const [emailIsValid, setEmailIsValid] = useState(false)
  const [textIsValid, setTextIsValid] = useState(false)

  const enableSubmit = emailIsValid && textIsValid

  const emailChangeHandler = event => {
    setEmailIsValid(!blackEmails.includes(event.target.value))
  }

  const textChangeHandler = event => {
    setTextIsValid(!blackWords.includes(event.target.value))
  }

  return (
    <form>
      <label htmlFor="email">メールアドレス</label>
      <input
        type="email"
        id="email"
        onChange={emailChangeHandler}
      />
      <label htmlFor="text">メッセージ</label>
      <textarea
        id="text"
        onChange={textChangeHandler}
      />
      <button
        type="submit"
        disabled={!enableSubmit}
      >
        送信
      </button>
    </form>
  )
}
```

<div class="filename">src/lib/blackList.js</div>

```js
export const blackEmails = ["aaa@example.com", "bbb@example.com"]

export const blackWords = ["お前の", "母ちゃん", "でべそ"]
```

### IPアドレスで判定

[ReactでIPアドレスを取得する方法](../get-ip-react/)を使って、IPアドレスでもブロックできます。

Reactで閲覧者のIPアドレスを取得するため、初回レンダリングの際に1回だけIP取得用のAPIに接続します。そのため、このケースでは`useEffect`を使います。

<div class="filename">src/components/Form.js</div>

```js
import React, { useState, useEffect } from "react"
import { blackEmails, blackIps } from "../lib/blackList"

const Form = () => {
  const [emailIsValid, setEmailIsValid] = useState(false)
  // 初期状態は空の定数`ip`を用意
  const [ip, setIp] = useState()

  const ipIsValid = ip && !blackIps.includes(ip)

  const enableSubmit = emailIsValid && ipIsValid

  const emailChangeHandler = event => {
    setEmailIsValid(!blackEmails.includes(event.target.value))
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
      <input
        type="email"
        id="email"
        onChange={emailChangeHandler}
      />
      <button
        type="submit"
        disabled={!enableSubmit}
      >
        送信
      </button>
    </form>
  )
}
```

<div class="filename">src/lib/blackList.js</div>

```js
export const blackEmails = ["aaa@example.com", "bbb@example.com"]

export const blackIps = ["123.456.789.01", "234.567.890.12"]
```

IP取得用のAPIは、上の例では登録不要のipapi.coに接続していますが、もちろん他のAPIでもかまいません。別のAPIの場合は返り値が多少異なる場合があるので、その辺は調整してください。

以上です。