---
title: 多言語のMarkdown + Next.jsブログに、言語別のRSSフィード生成機能を追加
tags:
  - markdown
  - nextjs
  - seo
  - internationalization
date: 2022-12-12T02:54:16.999Z
lastmod: 2022-12-12T03:00:48.149Z
draft: false
---

当サイト（route360.dev）にも、ブログ記事のRSSフィードを導入しました。

一つの言語のみであれば導入は難しくありませんが、何しろ三カ国語（英・仏・日）の多言語ブログです。購読者の利便性を考え、RSSフィードも言語別に生成する必要があり、やや難儀しました。

導入にあたり、こちらのブログを参考にさせて頂きました。ありがとうございます🙏

<span class="label warning">参考</span> [Next.jsにfeedを導入してRSSとAtomのフィードを生成しよう](https://fwywd.com/tech/next-feed-rss-atom)

こちらの記事のコードを元に、多言語対応をさせます。

動作環境：

- Node.js v16.18.0
- React v18.2.1
- Next.js v12.3.1
- feed v4.2.3
- marked v4.1.1

## 言語別RSSフィード作成の骨子（ポイント）

1. 言語別に記事のURLが異なる点をどうするか
2. 言語別の投稿一覧をどうRSSフィード生成関数に送るか

1 → タイトルが言語で異なるのは当然ですが、URLは言語によって言語名が入るか入らないかで分岐が必要になります（ [サブパスルーティング](https://nextjs.org/docs/advanced-features/i18n-routing)の場合）。そのため、RSSフィード生成の関数側でに言語ロケール（と記事一覧）を受け取り、生成内容を変えるという方法を取ります。

2 → 記事一覧はブログのトップページ表示用に既に作っているので、それを利用します。トップページでの`getStaticProps`による記事一覧生成時に、RSSフィード生成関数を挿入。その際に、言語ロケールと記事一覧をRSSフィード生成関数に送ります。

## feedをインストール

まずは、Node.js用パッケージの[feed](https://www.npmjs.com/package/feed)をインストールします。

```bash
## npmの場合
npm install feed

## yarnの場合
yarn add feed
```

## RSSフィード生成用の関数を用意

### 基本データの準備

まずは、例として基本データを用意。

```js
const siteTitle = {
  en: "My Great Website!",
  fr: "Mon site web superbe !",
  ja: "私のサイトは素晴らしい！",
}
const siteDesc = {
  en: "This is my finest website ever.",
  fr: "C'est mon site web le plus cool !",
  ja: "これ以上ない素晴らしすぎるサイトです。",
}
const siteUrl = "https://example.com/"
const defaultLocale = "en"
const author = "Tokugawa Ieyasu"
const email = "ieyasu@example.com"
```

上記はフィード用に表示するデータの例です。通常は、`/lib/constats.js`などにサイトの基本情報を用意していることと思いますので、それをインポートするなりして下さい。

### RSSフィードの基本データを生成

RSSフィードでは、サイトの基本情報がフィードの階層上部に来ます。まずはその部分を作ります。

<div class="filename">/lib/feed.js</div>

```js
import { Feed } from 'feed'

export default function GeneratedRssFeed(locale, posts) {
  const siteTitle = {
    en: "My Great Website!",
    fr: "Mon site web superbe !",
    ja: "私のサイトは素晴らしい！",
  }
  const siteDesc = {
    en: "This is my finest website ever.",
    fr: "C'est mon site web le plus cool !",
    ja: "これ以上ない素晴らしすぎるサイトです。",
  }
  const siteUrl = "https://example.com/"
  const defaultLocale = "en" // デフォルトの言語ロケール
  const author = "Tokugawa Ieyasu"
  const email = "ieyasu@example.com"

  const feed = new Feed({
    title: `${siteTitle[locale]}`,
    description: siteDesc[locale],
    id: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`,
    link: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`,
    language: locale,
    image: `${siteUrl}image.png`,
    favicon: `${siteUrl}favicon.png`,
    copyright: `Copyright ${siteTitle} All rights reserved`,
    generator: "Feed for Node.js", // オプション（初期値：https://github.com/jpmonette/feed）
    updated: new Date(), // オプション（初期値：生成日）
    feedLinks: {
      json: `${siteUrl}rss/feed.${locale}.json`,
      rss2: `${siteUrl}rss/feed.${locale}.xml`,
      atom: `${siteUrl}rss/feed.${locale}.xml`,
    },
    author: {
      name: author,
      email: email,
      link: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`
    }
  })
}
```

ここでのポイントは、言語ロケールによる言語別データの取得や分岐です。

サイトの基本情報をロケール別に用意している場合は、カッコ`[]`にロケールを入れることによって、表示を切り替えるようにしています（例：`siteTitle[locale]`）。

### RSSフィードに投稿データを追加

次に、RSSフィードに含める投稿内容を一つずつ、`.addItem()`によって追加していきます。

尚、ここの例での前提条件は、

- 各記事は`/pages/post/[slug].js`で生成 → URLは`https://example.com/post/my-post/`のような形になる（非デフォルト言語の場合は`/ja/`等が入る）
- 記事のメタデータ（`title`、`slug`、`date`等）はFrontmatterで管理

となっています。

また、`content`（本文）については、ここでは参考サイトと同様に`marked`で整形していますが、もちろん他のライブラリやモジュールを使っても問題ありません。

データ生成や管理方法によって少し異なってきますので、各自で調整して下さい。

<div class="filename">/lib/feed.js</div>

```js
import { Feed } from 'feed'
import { marked } from "marked"

export default function GeneratedRssFeed(locale, posts) {
  //...
  const feed = new Feed({
    //...
  })

  posts.forEach(post => {
    feed.addItem({
      title: post.frontmatter.title,
      id: locale === defaultLocale
        ? `${siteUrl}post/${post.frontmatter.slug}/`
        : `${siteUrl}${locale}/post/${post.frontmatter.slug}/`,
      link: locale === defaultLocale
        ? `${siteUrl}post/${post.frontmatter.slug}/`
        : `${siteUrl}${locale}/post/${post.frontmatter.slug}/`,
      description: marked(post.content).slice(0, 120),
      content: marked(post.content),
      author: [
        {
          name: author,
          email: email,
          link: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`
        }
      ],
      date: new Date(post.frontmatter.date),
    })
  })
}
```

やはり、ここでも`link`や`id`に使うURLは、言語によって代わるように分岐を入れています。

また、上記の例では`description`は120文字、`content`は全文としていますので、こちらも状況に応じて変更して下さい。

### RSSフィードを言語別に保存

最後に、fsモジュールを利用して、RSSフィードを`/public/rss/`フォルダ内に保存させます。

RSSフィードは言語別に保存させたいので、拡張子の前に言語ロケールを入れています。

<div class="filename">/lib/feed.js</div>

```js
import fs from 'fs'
//...

export default function GeneratedRssFeed(locale, posts) {
  //...
  posts.forEach(post => {
    //...
  })

  fs.mkdirSync('./public/rss', { recursive: true })
  fs.writeFileSync(`./public/rss/feed.${locale}.json`, feed.json1())
  fs.writeFileSync(`./public/rss/feed.${locale}.xml`, feed.rss2())
  fs.writeFileSync(`./public/rss/atom.${locale}.xml`, feed.atom1())
}
```

## ブログのトップページ生成時にRSSフィードを同時に生成

ブログのトップページ（最新○件を表示）を`getStaticProps`で生成する際に、同時に同じ件数のフィードも生成させるようにします。

当サイト（route360.dev）では、トップページは`/pages/index.js`で表示させているので、そのファイル内の`getStaticProps`に追記します。

Next.jsで多言語サイトを作っている場合、`getStaticProps`は引数にロケール情報をコンテキスト（`{ locale }`）として受け取れます。先ほど作った`GeneratedRssFeed()`の引数として、以下を渡します。

- 第1引数：ロケール言語`locale`
- 第2引数：記事の一覧（ここでは`posts`）

「記事の一覧」は最初の5件でいいので、以下では`slice()`を使い、最新5件のみに絞っています。

<div class="filename">/pages/index.js</div>

```js
import GeneratedRssFeed from 'lib/feed'

//...

export async function getStaticProps({ locale }) {
  //...
  GeneratedRssFeed(locale, posts.sort(sortByDate).slice(0, 5))
  //...
}
```

`sortByDate`は、マークダウンの投稿コンテンツを日付毎に並び替えるカスタムの関数で、「[一覧ページのコンテンツデータの生成方法 - getStaticProps | Next.js + Markdown + 多言語で作るサイトの設計方法](/ja/post/points-for-internationalization/#%E4%B8%80%E8%A6%A7%E3%83%9A%E3%83%BC%E3%82%B8%E3%81%AE%E3%82%B3%E3%83%B3%E3%83%86%E3%83%B3%E3%83%84%E3%83%87%E3%83%BC%E3%82%BF%E3%81%AE%E7%94%9F%E6%88%90%E6%96%B9%E6%B3%95---getstaticprops)」で作ったものです。

ここまで行うと、`index.js`を表示した際に、表示した言語のRSSフィードが生成されるのが確認できるかと思います。

## .gitignoreにRSSフィードを追加しておく

ローカルで生成したRSSフィードをレポジトリに上げてしまうと、実際のサイトでのビルド時にコンフリクト（衝突）が起こるため、レポジトリにはアップロードしないように指定しておきます。

<div class="filename">/.gitignore</div>

```text
/public/rss
```

## Google Search Console と Bingウェブマスターに登録

あとは、RSSフィードのリンクを自サイト内に表示したり、検索エンジンのツールに登録するだけです。

## コードまとめ

RSSフィード生成用のコンポーネントは、最終的に以下のようになります。

<div class="filename">/lib/feed.js</div>

```js
import fs from 'fs'
import { Feed } from 'feed'
import { marked } from "marked"

export default function GeneratedRssFeed(locale, posts) {
  const siteTitle = {
    en: "My Great Website!",
    fr: "Mon site web superbe !",
    ja: "私のサイトは素晴らしい！",
  }
  const siteDesc = {
    en: "This is my finest website ever.",
    fr: "C'est mon site web le plus cool !",
    ja: "これ以上ない素晴らしすぎるサイトです。",
  }
  const siteUrl = "https://example.com/"
  const defaultLocale = "en" // デフォルトの言語ロケール
  const author = "Tokugawa Ieyasu"
  const email = "ieyasu@example.com"

  const feed = new Feed({
    title: `${siteTitle[locale]}`,
    description: siteDesc[locale],
    id: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`,
    link: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`,
    language: locale,
    image: `${siteUrl}image.png`,
    favicon: `${siteUrl}favicon.png`,
    copyright: `Copyright ${siteTitle} All rights reserved`,
    generator: "Feed for Node.js", // オプション（初期値：https://github.com/jpmonette/feed）
    updated: new Date(), // オプション（初期値：生成日）
    feedLinks: {
      json: `${siteUrl}rss/feed.${locale}.json`,
      rss2: `${siteUrl}rss/feed.${locale}.xml`,
      atom: `${siteUrl}rss/feed.${locale}.xml`,
    },
    author: {
      name: author,
      email: email,
      link: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`
    }
  })

  posts.forEach(post => {
    feed.addItem({
      title: post.frontmatter.title,
      id: locale === defaultLocale
        ? `${siteUrl}post/${post.frontmatter.slug}/`
        : `${siteUrl}${locale}/post/${post.frontmatter.slug}/`,
      link: locale === defaultLocale
        ? `${siteUrl}post/${post.frontmatter.slug}/`
        : `${siteUrl}${locale}/post/${post.frontmatter.slug}/`,
      description: marked(post.content).slice(0, 120),
      content: marked(post.content),
      author: [
        {
          name: author,
          email: email,
          link: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`
        }
      ],
      date: new Date(post.frontmatter.date),
    })
  })

  fs.mkdirSync('./public/rss', { recursive: true })
  fs.writeFileSync(`./public/rss/feed.${locale}.json`, feed.json1())
  fs.writeFileSync(`./public/rss/feed.${locale}.xml`, feed.rss2())
  fs.writeFileSync(`./public/rss/atom.${locale}.xml`, feed.atom1())
}
```

これでRSSフィードを言語別に作れるようになりました。そこそこ面倒ですね😕

RSSフィードは直接的にはSEOには関係ありませんが、クローラーの巡回回数が増えたり、購読者のリピート率を上げる効果が期待できます。