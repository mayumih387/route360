---
title: Markdownのコンテンツ内にインスタグラムを埋め込む方法
tags:
  - markdown
  - gatsbyjs
  - nextjs
date: 2022-12-12T03:38:10.167Z
lastmod: 2022-12-12T03:38:20.498Z
draft: true
---

ライブラリやプラグインなしで、Markdownでコンテンツを管理している場合に、インスタグラムを埋め込む方法です。

インスタグラムの埋め込みコードをそのままMarkdownファイルに書き込んでも、Markdownは`<script>`を無視するため動きません。そのため、一工夫必要になります。

## HTMLファイルで出力してコピペする方法

- 埋め込みがないページへの影響なし
- 作業は面倒くさい

面倒ではありますが、簡易htmlファイルを用意して、そこに埋め込みコードをペーストし、出力を確認・コピペする方法です。

ときどきしか埋め込みをしない場合、こちらの方法が手軽です。

### 適当なHTMLファイルを用意する

ほぼ何もないHTMLファイルを作成。なんなら空でもいいです。

```html
<!DOCTYPE html>
<html>
  <head>
    <title>TEST</title>
  </head>
  <body>
    ここにコンテンツを記入。
  </body>
</html>
```

`<body>`タグ内に、埋め込みたいインスタグラム投稿の埋め込みコードをコピペします。

---

補足📖：埋め込みコードはスクリプトのsrcが、

`//www.instagram.com/embed.js`

となっており、ローカルのhtmlファイルではスクリプトが読み込まれません。その場合は

`https://www.instagram.com/embed.js`

と修正します。（補足終わり）

---

htmlファイルをブラウザで開き、F12を押して出力を確認。iframe部分をコピー。

![インスタグラムの画面](../../../images/instagram02.png "©instagram/gatsbyjs")

コピーした内容を、Markdownファイルにペーストすれば完成です。↓こんな感じで埋め込めます。

<iframe class="instagram-media instagram-media-rendered" id="instagram-embed-0" src="https://www.instagram.com/p/CemCUoLgeSI/embed/captioned/?cr=1&amp;v=14&amp;wp=810&amp;rd=file%3A%2F%2F&amp;rp=%2FC%3A%2FUsers%2Fharab%2FOneDrive%2F%25E3%2583%2589%25E3%2582%25AD%25E3%2583%25A5%25E3%2583%25A1%25E3%2583%25B3%25E3%2583%2588%2FExcelPython%2Ftest.html#%7B%22ci%22%3A0%2C%22os%22%3A209.19999998807907%2C%22ls%22%3A121.59999999403954%2C%22le%22%3A199.19999998807907%7D" allowtransparency="true" allowfullscreen="true" frameborder="0" height="937" data-instgrm-payload-id="instagram-media-payload-0" scrolling="no" style="background: white; max-width: 540px; width: calc(100% - 2px); border-radius: 3px; border: 1px solid rgb(219, 219, 219); box-shadow: none; min-width: 326px; padding: 0px;"></iframe>

スクリプトの読み込みも不要です。

## スクリプトをhead内で読み込む方法

- 条件を設定しないと、埋め込みがないページでもスクリプトの読み込みが発生する
- 初期設定さえすればコピペでいける

この方法では`<head>`内で埋め込み用スクリプトを読み込むため、埋め込みを行っていないページでもスクリプトの読み込みが発生します。

頻繁に埋め込みが発生する場合向けです。

### インスタグラムのスクリプトを読み込む

Next.jsであれば`_app.js`、Gatsby.jsであれば`gatsby-ssr.js`に、インスタグラムの埋め込み用スクリプトを追加します。

#### Next.jsの場合

<div class="filename">/pages/_app.js</div>

```js
import "styles/globals.css"
import Layout from "components/layout"

function MyApp({ Component, pageProps }) {
  return (
    <>
      <script async src="https://www.instagram.com/embed.js" />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}

export default MyApp
```

#### Gatsby.jsの場合

<div class="filename">gatsby-ssr.js</div>

```js
const React = require("react")

const HeadComponents = [
  <script async src="https://www.instagram.com/embed.js" key="instagram" />,
]

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents(HeadComponents)
}
```

※Gatsbyの場合は、追加するコード毎に`key`が必要になります。`key`は何でも良いですが、配列を`.map()`展開する時のように重複不可。

<span class="label warning">参考</span> [Gatsby Server Rendering APIs | Gatsby.js](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/)

### iframeのコードをMarkdownに追加

インスタグラムの通常の埋め込みコードは、htmlとして出力されるとiframeに変換されています。

以下のコードをコピペし、`[postID]`を、埋め込みたい投稿のIDに入れ替えます。スタイルは適宜調整してください（以下のスタイルは、インスタグラム埋め込みコードが勝手に生成する内容）。

```html
<iframe
  src="https://www.instagram.com/reel/[postID]/embed/"
  style=" background: white; max-width: 540px; width: calc(100% - 2px); border-radius: 3px; border: 1px solid rgb(219, 219, 219); box-shadow: none; display: block; margin: 0px 0px 12px; min-width: 326px; padding: 0px;"
></iframe>
```

埋め込みたい投稿のIDは、当該の投稿のURLから確認できます。

![インスタグラムの画面](../../../images/instagram01.png "©instagram/gatsbyjs")

## 余談（Twitterの場合）

同様の方法で、Twitterの投稿も埋め込みができるようになります。

Twitterに関しては、Gatsby.jsの場合は公式プラグイン（[gatsby-plugin-twitter](https://www.gatsbyjs.com/plugins/gatsby-plugin-twitter/)）が用意されています。プラグインを使えばTwitterを埋め込んでいないページではスクリプトは読み込まれないため、より効率的です。
