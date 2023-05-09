---
title: ReactでクライアントのIPアドレスを取得（Axiosなし）
tags:
  - react
date: 2022-11-24T02:00:00.185Z
lastmod: 2023-03-02T07:16:14.505Z
draft: false
---

問い合わせフォームやコメント欄のいたずら防止用としてIPアドレスを取得する必要があったために、実施した方法です。

Javascriptは単体では閲覧者のIPアドレスを取得できないため、外部APIを利用します。

今回利用するReact Hookは`useState()`と`useEffect()`です。

- [デモ](https://starlit-lollipop-635291.netlify.app/demo/getip-demo)
- [コード（GitHub）](https://github.com/mayumih387/demo-nextjs/blob/main/pages/demo/getip-demo.js)

デモはNext.js上に作っていますが、フレームワークを使わないReactアプリでも問題ないはずです。

## 今回利用するAPI

https://ipapi.co/

- 会員登録不要
- Adblockによるブロックなし（記事投稿時点では）

[ipinfo.io](https://ipinfo.io/)も試してみましたが、Adblockがあると上手く動きませんでした。登録が必要な分、機能は多いです。また、ipinfo.ioは退会の際にサポートにわざわざメールで連絡する必要がありますので、「ちょっと試したいだけ」には少々面倒です。

他にもいくつかIPアドレスを取得出来る無料のAPIサービスはあります。基本的にコードは同じ（多少、IP取得のためのオブジェクトは代わる）なので、アレンジしてみて下さい。

私のオススメは[Abstract API](https://www.abstractapi.com/)による「IP Geolocation API」です。利用に登録が必要で、月20,000リクエストまでが無料です。Adblockによる不具合もなく、以下に追記したipapi.coようなIPv6での返答も（恐らく）ありません。

### ipapi.coの注意点（2023.1.12追記）

アクセス元により、IPアドレスがIPv6形式で返される場合があります。

例: "240d:1a:b21:8500:9809:92e9:d811:7033A"

IPv4形式のみで利用したい場合は、ipapi.coでは有料プランの利用が必要になります。

## コード

```js
import { useState, useEffect } from 'react'

export default function GetIP() {
  // 初期状態は空の定数`ip`を用意
  const [ip, setIp] = useState()

  const getIp = async () => {
    // fetchを使ってipapi.coに接続
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    // 取得したIPアドレスを、定数`ip`にセット
    setIp(data.ip)
  }

  // 関数`getIP`を初回レンダリングでのみ発動させる
  useEffect(() => {
    getIp()
  }, [])

  return (
    <p>あなたのIPアドレスは{ip}です。</p>
  )
}
```

1. 初期状態は空の定数`ip`を用意する
2. 関数`getIP`の中で、fetchを使って[ipapi.co](https://ipapi.co/)に接続。取得したIPアドレスを、`ip`にセット
3. `useEffect()`を使い、関数`getIP`を初回レンダリングで発動させる

`const data = await response.json()`で、データを取得していますので、この直下で`console.log(data)`を走らせると、以下のようなデータ（オブジェクト）が格納されているのが確認できます。

```js
{
  "ip": "185.94.188.134",
  "network": "185.94.188.0/24",
  "version": "IPv4",
  "city": "Amsterdam",
  "region": "North Holland",
  "region_code": "NH",
  "country": "NL",
  "country_name": "Netherlands",
  "country_code": "NL",
  "country_code_iso3": "NLD",
  "country_capital": "Amsterdam",
  "country_tld": ".nl",
  "continent_code": "EU",
  "in_eu": true,
  "postal": "1012",
  "latitude": 52.3716,
  "longitude": 4.8883,
  "timezone": "Europe/Amsterdam",
  "utc_offset": "+0200",
  "country_calling_code": "+31",
  "currency": "EUR",
  "currency_name": "Euro",
  "languages": "nl-NL,fy-NL",
  "country_area": 41526,
  "country_population": 17231017,
  "asn": "AS9009",
  "org": "M247 Ltd"
}
```

IPアドレスだけでなく、国名や経度緯度、タイムゾーンや、更にはユーロ圏であるかどうかも取得出来るので、様々な用途に使えそうです。

このあたりはReactの基礎の部分なので、よい練習になります。とは言え、ここに来た方々はコピペで終わりでしょうね😂