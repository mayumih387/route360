---
title: 多言語Gatsby.jsサイトの、XMLサイトマップ作成方法
tags:
  - gatsbyjs
  - internationalization
  - markdown
  - seo
date: 2023-05-26T01:00:00.000Z
lastmod: 2023-05-26T01:00:00.000Z
draft: false
---

当サイトroute360.devは、Gatsby.jsで作られた多言語サイトです。

今回、Gatsby.js公式のサイトマップ生成プラグイン「[gatsby-plugin-sitemap](https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/)」を用いて、多言語サイト用にカスタマイズする方法を説明します。

このブログは[リポジトリを公開](https://github.com/mayumih387/route360)していますので、詳細なコードを確認されたい方はアクセスしてみてください。この記事のコードは、説明のため多少簡略化しています。

動作環境:

- gatsby v5.10.0
- gatsby-plugin-sitemap v6.10.0
- react v18.2.0
- node v18.16.0

## 前提条件

今回は当サイトの例として、Markdownでコンテンツが構成されるサイトで説明します。CMSを使っている場合は、`query`部分を適宜修正してください。

### ページのURLパスの構成

ページのURLパスの構成は以下の通りです。

- 記事ページ `/[lang]/post/[slug]/`
- 独立ページ `/[lang]/[slug]/` ※about・contactページ等
- タグページ `/[lang]/tag/[slug]/`
- タグページ（2ページ目以降）`/[lang]/tag/[slug]/page/[num]/`
- トップページ `/[lang]/`
- トップページ（2ページ目以降）`/[lang]/page/[num]/`

ポイント：

- 翻訳記事のスラッグはすべての言語で共通
- 必ず言語コードがルートドメイン直下のパスに入る

翻訳記事のスラッグが言語毎に違う場合や、デフォルト言語で言語コードをパスに含めない場合、コードが多少違ってきますので、コピペでのご利用にご注意ください。

また、今回は言語毎にアーカイブページのページ数が違う場合も考慮します。

## 目標

[Googleのガイド](https://developers.google.com/search/docs/specialty/international/localized-versions?hl=ja#sitemap)に書いてあるようなサイトマップ生成を目指します。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://www.example.com/english/page.html</loc>
    <xhtml:link
               rel="alternate"
               hreflang="de"
               href="https://www.example.de/deutsch/page.html"/>
    <xhtml:link
               rel="alternate"
               hreflang="de-ch"
               href="https://www.example.de/schweiz-deutsch/page.html"/>
    <xhtml:link
               rel="alternate"
               hreflang="en"
               href="https://www.example.com/english/page.html"/>
  </url>
  <url>
    <loc>https://www.example.de/deutsch/page.html</loc>
    <xhtml:link
               rel="alternate"
               hreflang="de"
               href="https://www.example.de/deutsch/page.html"/>
    <xhtml:link
               rel="alternate"
               hreflang="de-ch"
               href="https://www.example.de/schweiz-deutsch/page.html"/>
    <xhtml:link
               rel="alternate"
               hreflang="en"
               href="https://www.example.com/english/page.html"/>
  </url>
  <url>
    <loc>https://www.example.de/schweiz-deutsch/page.html</loc>
    <xhtml:link
               rel="alternate"
               hreflang="de"
               href="https://www.example.de/deutsch/page.html"/>
    <xhtml:link
               rel="alternate"
               hreflang="de-ch"
               href="https://www.example.de/schweiz-deutsch/page.html"/>
    <xhtml:link
               rel="alternate"
               hreflang="en"
               href="https://www.example.com/english/page.html"/>
  </url>
</urlset>
```

## コード概要

早速ですが、コードです。

<div class="filename">gatsby-config.js</div>

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        query: `
        {
          site {
            siteMetadata {
              siteUrl
            }
          }
          allSitePage {
            nodes {
              path
            }
          }
        }`,
        resolvePages: ({ allSitePage: { nodes: allPages } }) => {
          const pages = allPages.map(page => {
            const alternateLangs = allPages
              .filter(
                alterPage =>
                  alterPage.path.replace(/\/.*?\//, "/") ===
                  page.path.replace(/\/.*?\//, "/")
              )
              .map(alterPage => alterPage.path.match(/^\/([a-z]{2})\//))
              .filter(match => match)
              .map(match => match[1])

            return {
              ...page,
              ...{ alternateLangs },
            }
          })

          return pages
        },
        serialize: ({ path, alternateLangs }) => {
          const pagepath = path.replace(/\/.*?\//, "/")

          const xhtmlLinks =
            alternateLangs.length > 1 &&
            alternateLangs.map(lang => ({
              rel: "alternate",
              hreflang: lang,
              url: `/${lang}${pagepath}`,
            }))

          let entry = {
            url: path,
            changefreq: "daily",
            priority: 0.7,
          }

          if (xhtmlLinks) {
            entry.links = xhtmlLinks
          }

          return entry
        },
      },
    },
  ],
}
```

※[当ページの実際のコード](https://github.com/mayumih387/route360/blob/main/gatsby-config.js)は投稿ページの`lastmod`も追加しているため、もう少し複雑になっています。

## サイトマップの出力例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
  <url>
    <loc>https://route360.dev/en/post/gatsby-i18n/</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://route360.dev/en/post/gatsby-i18n/" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://route360.dev/fr/post/gatsby-i18n/" />
    <xhtml:link rel="alternate" hreflang="ja" href="https://route360.dev/ja/post/gatsby-i18n/" />
  </url>
  <url>
    <loc>https://route360.dev/en/post/codeium/</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://route360.dev/en/post/codeium/" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://route360.dev/fr/post/codeium/" />
    <xhtml:link rel="alternate" hreflang="ja" href="https://route360.dev/ja/post/codeium/" />
  </url>
  <!-- 以下略 -->
</urlset>
```

参考までに、[当サイトのサイトマップはこちら](https://route360.dev/sitemap-0.xml)。

## コードの説明

概要としては、

1. すべてのページのパスを展開し、同じURLパスの翻訳ページの言語コード（そのURL自体を含む）を配列`alternateLangs`へ代入
2. `alternateLangs`（言語数）が2以上の場合、`<xhtml:link rel="alternate" hreflang="lang_code" href="page_path" />`をサイトマップに追加する

と言った具合です。

### 各URLパスの翻訳ページの言語コードを配列にする

まずは前半部分。

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        // ...

        resolvePages: ({ allSitePage: { nodes: allPages } }) => {
          const pages = allPages.map(page => {
            const alternateLangs = allPages
              // 同じパスの翻訳ページ（そのURL自体を含む）を抽出
              // 例）/en/first-post/ と /ja/first-post/ の /first-post/ が一致すればtrue
              .filter(
                alterPage =>
                  alterPage.path.replace(/\/.*?\//, "/") ===
                  page.path.replace(/\/.*?\//, "/")
              )
              // 翻訳ページのパスから言語コードを取得し配列化
              .map(alterPage => alterPage.path.match(/^\/([a-z]{2})\//))
              // nullを排除 .filter(Boolean)でも可
              .filter(match => match)
              // 言語コードのみを配列化
              .map(match => match[1])

            return {
              ...page,
              ...{ alternateLangs }, // 言語コードをデータに追加
            }
          })

          return pages
        },

        // ...
      },
    },
  ],
}
```

正規表現でパスから以下の文字列を取得する、若干の荒技？です。

- 言語コード
- 言語コードを除いたページパス

当サイトの場合、`gatsby-node.js`でpageContextに言語コード・markdownRemarkにスラッグを渡しているので、クエリから現在の言語コードやスラッグも取得できますが、説明と汎用性のためにこのようなコードにしました。

CMSを使っている場合はクエリから言語コードを取得できる場合もあると思います。

### 言語数が2以上の場合のみ、xhtml:linkを追加

次に、後半部分です。

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        //...

        serialize: ({ path, alternateLangs }) => {
          // 言語コードを除いたページパスを取得
          const pagepath = path.replace(/\/.*?\//, "/")

          // 翻訳ページ（そのURL自体を含む）用コードを生成
          const xhtmlLinks =
            alternateLangs.length > 1 && // 翻訳数が2以上の場合
            alternateLangs.map(lang => ({
              rel: "alternate",
              hreflang: lang,
              url: `/${lang}${pagepath}`,
            }))

          // デフォルトの<url>要素
          let entry = {
            url: path,
            changefreq: "daily",
            priority: 0.7,
          }

          // 翻訳がある場合は<url>に子要素<xhtml:link rel="alternate" hreflang="lang">を追加
          if (xhtmlLinks) {
            entry.links = xhtmlLinks
          }

          return entry
        },
      },
    },
  ],
}
```

これにより、翻訳ページがある場合にのみ、`<url>`の子要素`<xhtml:link rel="alternate" hreflang="lang">`が生成され、サイトマップに追加されます。

以上です。

## 参考サイト

- [ページのローカライズ版について Google に知らせる | Google for developers](https://developers.google.com/search/docs/specialty/international/localized-versions?hl=ja#sitemap)
- [gatsby-plugin-sitemap | Gatsby](https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/)
