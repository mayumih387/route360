---
title: Abstract APIのメールアドレス判定をフォームに導入する[React]
tags:
  - react
date: 2022-11-05T01:00:00.000Z
lastmod: 2022-11-15T02:28:00.965Z
draft: false
---

コメントフォームや問い合わせフォームなどで、いたずら防止のための1つの方法として、**メールアドレスの有効性可否判定**（メールアドレス バリデーション）があります。

フォームに入力されたメールアドレスをリアルタイムで判定できるため、有効な場合にのみ送信ボタンを押せるようするなどにより、劇的に迷惑メールや迷惑コメントを減らすことが可能です。

- [デモ](https://starlit-lollipop-635291.netlify.app/demo/email-demo)
- [コード（GitHub）](https://github.com/mayumih387/demo-nextjs/blob/main/pages/demo/email-demo.js)

※デモは無料枠の月100件までの利用です。上記が動かなかったら無料枠を使い切っている可能性があります。

今回使用するReact Hook：`useState()`と`useRef()`

動作環境：

- Node.js v18.12.1
- React v18.2.0

## APIに登録する

https://www.abstractapi.com/

今回は、[Abstract API](https://www.abstractapi.com/api/email-verification-validation-api)の無料枠を使って、メールアドレスのバリデーションを実装します。

無料枠は月100件までです。個人ブログのコメント欄（特に閑古鳥が鳴いているこのサイトのような・・・）であれば十分でしょう。

## フォームのコンポーネントを作る

今回は説明の簡便化に、フォームコンポーネントに直接Eメール判定機能を追加します。マメな方であれば、判定機能をさらに別のコンポーネントにしてもいいですね。

### フォーム部分

<div class="filename">/components/form.js</div>

```js
const Form = () => {
  return (
    <form>
      <input id="email" name="email" type="email" required />
    </form>
  )
}

export default Form
```

### Eメールの入力内容を記憶する

`useRef()`を使い、入力内容を取得できるようにします。

<div class="filename">/components/form.js</div>

```js
import { useRef } from "react"

const Form = () => {
  const emailRef = useRef()
  return (
    <form>
      <input id="email" name="email" type="email" required ref={emailRef} />
    </form>
  )
}

export default Form
```

入力内容は`emailRef.current.value`で取得できます。

### Eメール形式かどうかを判定するための定数

無駄に判定が起きないように、「入力内容がE-mail形式の時のみ判定」が働くようにします。その判定のための、「E-mail形式」を用意。

```js
const pattern =
  /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/
```

### Eメールの入力からカーソルが外れた時に判定をする

#### 状態の追加

`useState()`で、

- `emailIsValid`: Eメールが有効かどうか（初期状態`false`）

の定数を追加します（定数名は任意）。Eメールが有効の時にのみ、状態をtrueにすればいいわけです。

<div class="filename">/components/form.js</div>

```js
import { useRef, useState } from "react"
//...

const Form = () => {
  const emailRef = useRef()
  const [emailIsValid, setEmailIsValid] = useState(false)
  //...
  return {
    //...
  }
}
```

#### ハンドラの追加

`input`からカーソルが外れた時に判定を行うハンドラを追加します。「カーソルが外れた時」は`onBlur`属性ですね。

さらに、ハンドラは入力内容が定数`pattern`に合致する場合のみに動かし、無駄に判定をしないようにしておきます。`useRef()`を使って記憶した`emailRef`からは、`emailRef.current.value`とすることで、現在の入力値を参照することができます。それをjavascriptの`test()`メソッドを使い、`pattern`で定義したEメール形式（正規表現）に合致するかどうかを判定しています。

```js
pattern.test(emailRef.current.value)
```

<span class="label warning">参照</span> [RegExp.prototype.test() - JavaScript - MDN Web Docs - Mozilla](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test)

`onBlur`の時に発火するハンドラ名は、ここでは`emailCheckHandler`としていますが、名前は任意です。APIと非同期通信を行うため、`async`を噛ませています。

<div class="filename">/components/form.js</div>

```js
import { useRef, useState } from "react"
const pattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/

const Form = () => {
  //...

  const emailCheckHandler = async () => {
    if (pattern.test(emailRef)) {
      // ここに判定

      if () { // 合格時
        setEmailIsValid(true)
      } else { // 不合格時
        setEmailIsValid(false)
      }
    }
  }

  return (
    <form>
      <input
        id="email"
        name="email"
        type="email"
        required
        ref={emailRef}
        onBlur={emailCheckHandler}
      />
    </form>
  )
}

export default Form
```

#### Abstract APIに接続して判定

APIへの接続には、`fetch()`を使います。

Abstract APIでは、以下のURLへアクセスすることでバリデーション結果が取得できます。

```html
https://emailvalidation.abstractapi.com/v1/?api_key=[API_KEY]&email=[EMAIL_TO_VALIDATE]
```

APIに接続してレスポンスを取得

```js
const url =
  "https://emailvalidation.abstractapi.com/v1/?api_key=[API_KEY]&email=[EMAIL_TO_VALIDATE]"
const response = await fetch(url)
const data = await response.json()
```

`console.log(data)`等でレスポンスを確認すると、以下のようなデータを確認できます。

```js
{
  "email": "eric@abstractapi.com",
  "autocorrect": "",
  "deliverability": "DELIVERABLE",
  "quality_score": "0.80",
  "is_valid_format": {
    "value": true,
    "text": "TRUE"
  },
  "is_free_email": {
    "value": false,
    "text": "FALSE"
  },
  "is_disposable_email": {
    "value": false,
    "text": "FALSE"
  },
  "is_role_email": {
    "value": false,
    "text": "FALSE"
  },
  "is_catchall_email": {
    "value": true,
    "text": "TRUE"
  },
  "is_mx_found": {
    "value": true,
    "text": "TRUE"
  },
  "is_smtp_valid": {
    "value": true,
    "text": "TRUE"
  }
}
```

Abstract APIのEメールバリデーションは、スコア`quality_score`によって信頼度を判定しています（最小0.01、最大0.99）。

上記ではレスポンスを`data`に代入したので、スコア自体は`data.quality_score`で取得できますね。

実際にテストしてみたところ、手持ちのGmailではスコアが0.7でした。いくつかのメールアドレスで試してみて基準を確認し、「0.7以上ならOK」等としておけばいいでしょう。

判定部分のコードはこうなります。APIキーは露出させると悪用の恐れもありますので、必ず`.env`ファイルに環境変数として管理します。

<div class="filename">/components/form.js</div>

```js
const emailCheckHandler = async () => {
  if (pattern.test(emailRef.current.value)) {
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&email=${emailRef.current.value}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.quality_score >= 0.7) {
      // 合格時
      setEmailIsValid(true)
    } else {
      // 不合格時
      setEmailIsValid(false)
    }
  }
}
```

環境変数はクライアントサイドでの動作になるため、Next.jsやGatsby.jsの場合は接頭辞を追加する必要があります。

<div class="filename">.env</div>

```bash
# Next.jsの場合
NEXT_PUBLIC_ABSTRACT_API=xxxxxxxxxxxxxxxxx

# Gatsby.jsの場合
GATSBY_ABSTRACT_API=xxxxxxxxxxxxxxxxx
```

## コードまとめ

<div class="filename">/components/form.js</div>

```js
import { useRef, useState } from "react"

const pattern =
  /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/
const Form = () => {
  const emailRef = useRef()
  const [emailIsValid, setEmailIsValid] = useState(false)

  const emailCheckHandler = async () => {
    if (pattern.test(emailRef.current.value)) {
      const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API}&email=${emailRef.current.value}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.quality_score >= 0.7) {
        setEmailIsValid(true)
      } else {
        setEmailIsValid(false)
      }
    }
  }

  return (
    <form>
      <input
        id="email"
        name="email"
        type="email"
        required
        ref={emailRef}
        onBlur={emailCheckHandler}
      />
    </form>
  )
}

export default Form
```

## さらに実用的にするには

ここでは単にバリデーション部分のみの解説となりましたが、reCaptcha等と組み合わせるとより安全性の高いフォームにすることができます。

- reCaptchaやhCaptchaの実装（安全性の向上）
- メールアドレス判定やreCaptchaの合格後に送信ボタンを有効化（安全性の向上）
- メールアドレス判定中にスピナーの表示（ユーザー体験の向上）

フォームは他にも気をつける点が多いです。[公式のフォーム・バリデーションの解説](https://www.abstractapi.com/guides/react-form-validation#react-hook-form-validation)もわかりやすいので、チェックしてみてください。

以上です。
