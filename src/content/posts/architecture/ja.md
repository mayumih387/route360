---
title: このサイトのフロントエンド構造について
tags:
  - nextjs
  - markdown
  - jamstack
date: 2022-10-04T06:09:56.322Z
lastmod: 2022-10-27T06:56:17.705Z
draft: false
---

当サイト（route360.dev）のアーキテクチャ・設計について紹介します。

## Reactフレームワーク: Next.js

[Next.js](https://nextjs.org/)を採用した理由は、**多言語サイト対応が導入しやすかったから**です。

当初はGatsby.jsで多言語サイトの構築を試みていました。

しかしGatsby.jsは、（アプリではない）このような通常のウェブサイト・ブログ等には非常に使い勝手が良いのですが、こと多言語化となると使い勝手がイマイチです。多言語化用プラグインも公式・サードパーティー含めいくつかあるものの、公式製はGitHubページがなくなっていたり、サードパーティー製でも開発が止まっています。

### 多言語化の方法

Gatsby.jsでは少々複雑な多言語設定も、Next.jsではコンフィグ用の`next.config.js`にロケール設定を入れるだけです。

当サイトの`next.config.js`

<div class="filename">/next.config.js</div>

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en", "fr", "ja"],
    defaultLocale: "en",
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

もちろんこれだけではなく、SEO対策には他にも色々することはありますが、この設定をするだけで、サイト内リンクは自動で書き換わります。他のi18n系のライブラリ・モジュールは使っていません。

## UIフレームワーク: なし

UIフレームワークは使っていません。cssモジュールです。

## ヘッドレスCMS: なし

当初は[DatoCMS](https://www.datocms.com/)で作成していましたが、無料プランではレコードが300までと非常に少ないことに気付き、急遽ローカルMarkdownで作り直しました。

ヘッドレスCMSでは[Contentful](https://www.contentful.com/)でも多言語サイト構築（レコード25,000まで無料）が可能ですが、無料プランでは2カ国語までです。今回は3カ国語対応のため、Contentfulは断念。

日本の国産ヘッドレスCMSは、多言語の機能はあっても有料ですね。もうちょっと頑張れ、日本のCMS。

## ホスティング: Vercel

https://vercel.com/

ホスティングには使い慣れた[Cloudflare Pages](https://pages.cloudflare.com/)を利用したかったのですが、多言語設定（i18n）を入れているため`next export`がサポートから外れてしまい、色々試したもののどうにもデプロイができなかったため、半ば仕方なしにVercelを使っています。

## その他

- コメントシステム - [giscus](https://giscus.app/)
- Webフォント - [Fontawesome](https://fontawesome.com/)
- シンタックスハイライト - [Prism.js](https://prismjs.com/)
- 翻訳 - 自力😅（DeepLの多大なご協力あり）

## まとめ

Next.js自体の勉強も兼ねて作ったサイトですが、Gatsby.jsとの違いに大分戸惑いつつも、ある程度形になったかと思います。

多言語サイトの作り方もわかったので、手持ちの他のサイトもNext.jsで作り直したいところです。
