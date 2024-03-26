---
title: Reactで、盗用防止のためテキストコピー時にランダム文字列を返す方法
tags:
  - react
date: 2024-03-26
lastmod: 2024-03-26
draft: false
---

Reactフレームワーク（NextJS、Gatsbyなど）で運用しているウェブサイトの、コピペ盗用対策です。

テキストをコピーした際に、クリップボードにはそのテキストではなく、ランダム文字列を返す方法となります。

動作環境

- React v18.2.0

## Reactでのテキストコピー防止コード

コンポーネント内に以下を追加。

```js
const handleCopy = () => {
  let copiedText = ""
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()"
  for (let i = 0; i < 10 ; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    copiedText += chars[randomIndex]
  }
  navigator.clipboard.writeText(copiedText)
}

return (
  <body onCopy={handleCopy}>
    {children}
  </body>
)
```

## 解説

コピー操作が行われた際に、`handleCopy`が発火します。

`for`内で10回、`chars`の中から文字が選ばれ、選ばれた順にランダム文字列`copiedText`に追加されていきます。

その後、`navigator.clipboard.writeText()`により、クリップボードには10文字のランダム文字列がコピーされます。

今回、文字数は簡易的に10としましたが、たとえば`event`でコピーされた文字の文字数を取得して、コピーされた文字数と同じにする、といったこともできると思います。その場合、最大文字数をセットしておいたほうがいいかもしれません。

また、上記コードでは、`<body>`内のすべての要素に対してコピー防止対策をしていますが、たとえばコンテンツ部分だけでもいいでしょう。

スクレイピング対策にはなりませんが、「人間が行うコピペの多少は防げる」という感じですね。

以上です。