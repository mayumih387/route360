---
title: Astroブログで関連記事を表示させる
tags:
  - astro
  - markdown
date: 2023-01-11T00:00:00.000Z
lastmod: 2023-01-12T15:06:31.446Z
draft: false
---

AstroとMarkdownで作るブログ形式の静的サイトで、関連記事を生成する一つのアイディアです。

APIで記事を取得する場合も、絞り込み等をアレンジすれば使えると思います。

動作環境

- astro v1.9.1

## Astroサイトの構造

今回は、以下の構造でAstroブログを作ることとします。

```text
src/
  ├ pages/
  │  └ [slug].astro
  ├ posts/
  │  ├ first-post.md
  │  ├ second-post.md
  │  └ ...
  └ lib/
    └ getRelatedPosts.js
```

`src`フォルダー直下の`[slug].astro`をブログ記事用テンプレートとし、URLパスとしては`https://example.com/[slug]/`という形になります。

### Markdown記事のYAML frontmatter

投稿のMarkdownのYAML frontmatterには、

```md
---
title: 最初の投稿です
slug: first-post
categories: ["book", "english"]
---
```

などと設定しておきます。

## 関連記事生成用の関数

`lib`フォルダ下に`getRelatedPosts.js`というファイルを作り、記事生成用の関数を作ります。

```text
src/
  └ lib/
    └ getRelatedPosts.js
```

最も簡単なパターンとして、「現在の投稿の、一番最初に指定されているカテゴリーと同じカテゴリーを持つ投稿4つ」を取得することとします。

<div class="filename">/src/lib/getRelatedPosts.js</div>

```js
export function getRelatedPosts(allPosts, currentSlug, currentCats) {
  const relatedPosts = allPosts.filter(
    post =>
      post.frontmatter.slug !== currentSlug &&
      post.frontmatter.categories.includes(currentCats[0])
  )

  return relatedPosts.slice(0, 4) // slice()で最初の4つを取得
}
```

1. すべての投稿（allPosts・配列）・現在の投稿（currentSlug）・現在の投稿のカテゴリー（currentCats・配列）を引数とする
2. すべての投稿（allPosts・配列）から、現在の投稿（currentSlug）以外かつ、現在の投稿の最初に設定されているカテゴリーを含む投稿を絞り込む
3. 絞り込んだ投稿（relatedPosts・配列）の最初の4つを取得

やろうと思えば、「同じタグを含むもの」「同じタグが多く含まれるもの順」などもできるとは思いますが、今回はそこまでは頑張りません😅

### ランダムで取得する

ランダムで関連記事を生成したい場合は、上記コードにランダム抽選させる関数をかませればOK。

<div class="filename">/src/lib/getRelatedPosts.js</div>

```js
export function getRelatedPosts(allPosts, currentSlug, currentCats) {
  // ランダム抽選用関数
  const randomLot = (array, num) => {
    let newArray = []

    while (newArray.length < num && array.length > 0) {
      const randomIndex = Math.floor(Math.random() * array.length)
      newArray.push(array[randomIndex])
      array.splice(randomIndex, 1)
    }

    return newArray
  }

  const relatedPosts = allPosts.filter(
    post =>
      post.frontmatter.slug !== currentSlug &&
      post.frontmatter.categories.includes(currentCats[0])
  )

  return randomLot(relatedPosts, 4) // ここでランダム抽選させる
  // return relatedPosts.slice(0, 4)
}
```

## 記事用テンプレート内で記事毎に関連記事を生成

`[slug].astro`は、こんな感じです。

<div class="filename">/src/pages/[slug].astro</div>

```js
---
import { getRelatedPosts } from "../lib/getRelatedPosts"

export async function getStaticPaths() {
  // すべての記事を取得
  const allPosts = await Astro.glob("../posts/*.md")
  // 記事数を取得
  const numberOfPosts = allPosts.length

  return allPosts.map((post) => ({
    params: {
      slug: post.frontmatter.slug,
    },
    props: {
      post,
      // ここで関連記事のプロパティを渡す
      relatedPosts: getRelatedPosts(
        allPosts,
        post.frontmatter.slug,
        post.frontmatter.categories
      ),
    },
  }))
}

// 関連記事をテンプレート用に取得
const { relatedPosts } = Astro.props
---

// 関連記事を展開
{relatedPosts.length > 0 && (
  relatedPosts.map((post) => (
    <li><a href={`/${post.frontmatter.slug}/`}>{post.frontmatter.title}</a></li>
  ))
)}
```

実際の場面では、すべての記事から下書き投稿を除外したり、関連記事部分はコンポーネント化したりすると思います。そこはよしなにやってください。

以上です。
