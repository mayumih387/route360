---
title: Astroブログ記事内に、前後の記事を表示させる
tags:
  - astro
  - markdown
date: 2023-01-23T15:00:00.000Z
lastmod: 2023-02-15T05:58:23.929Z
draft: false
---

Astro + Markdownのブログで、前後の記事を表示させる方法です。

CMSのAPI等でデータを引っ張ってくる場合でも、渡すデータを変えれば使えると思います。

ざっくりした流れは、

1. 全記事を取得し、日付順（新着順）に並び替える
2. 全記事の中の、現在の記事のインデックスを取得
3. 現在の記事のインデックスから、前後の記事をインデックスから取得
4. 前後の記事のどちらかがない場合も、空のデータを生成する
5. 前後の記事がある場合にのみ、それぞれを表示

といった感じです。

動作環境

- Astro v2.0.11

## プロジェクトの構造

今回は、以下の構造でAstroブログを作ることとします。

`pages`フォルダー下の`[slug].astro`をブログ記事用テンプレートとして利用。URLパスは`https://example.com/[slug]/`という形になります。

```tree
src/
├─ components/
│    └─ prevNext.astro
├─ pages/
│    └─ [slug].astro
├─ posts/
│    ├─ first-post.md
│    ├─ second-post.md
│    └─ ...
├─ utils/
│    └─ sortByDate.js
```

- `/components/prevNext.astro` 前後の記事用コンポーネント
- `/pages/[slug].astro` 個別記事用のテンプレート
- `/utiles/sortByDate.js` 日付順（新しい順）に記事を並べ替えるための関数のファイル

### Markdown記事のYAML frontmatter

投稿のMarkdownのYAML frontmatterには、

```md
---
title: 最初の投稿です
slug: first-post
date: 2023-01-01
---
```

などと設定しておきます。

## 日付順に記事を並べ替える関数を作る

Next.jsのブログ等でおなじみ（？）の、日付順に記事を並び替える関数です。

<div class="filename">/src/utils/sortByDate.js</div>

```js
export const sortByDate = (a, b) => {
  return new Date(b.frontmatter.date) - new Date(a.frontmatter.date)
}
```

今回はMarkdown記事のため、`new Date()`の日時の引数に`frontmatter.date`を代入していますが、API等の場合はそれに応じたデータを渡すようにしてください。

## 記事用テンプレート内で記事毎に前後の記事を生成

記事用テンプレート`[slug].astro`内で`getStaticPaths()`により記事データを生成する際に、前後の記事データも同時に取得・生成させます。

今回はMarkdownブログの例なので、前後の記事のプロパティとしてfrontmatter（該当する記事がない場合は、空のfrontmatter）をテンプレートに渡しています。

API等の場合は`slug`等、Markdownのfrontmatterに応じたデータを渡すようにしてください。

<div class="filename">/src/pages/[slug].astro</div>

```js
---
import { sortByDate } from "./utils/sortByDate.js"

export async function getStaticPaths() {
  const allPosts = await Astro.glob("../posts/*.md")
  const numberOfPosts = allPosts.length // すべての記事の合計数

  return allPosts.sort(sortByDate).map((post, i) => ({ // 並び替えてから展開
    params: {
      slug: post.frontmatter.slug,
    },
    props: {
      post,
      prevPost: // 一つ前の記事
        i + 1 === numberOfPosts // 現在の投稿が最古の記事の場合
          ? { frontmatter: ""}
          : allPosts[i + 1],
      nextPost: // 一つの記事
        i === 0 // 現在の投稿が最新の記事の場合
          ? { frontmatter: "" }
          : allPosts[i - 1],
    },
  }))
}

const { prevPost, nextPost } = Astro.props // テンプレート内で使えるデータとして前後の記事を取得
---
```

前後の記事を`Astro.props`で取得できたら、テンプレート内で読み込めばOK。

<div class="filename">/src/pages/[slug].astro</div>

```js
---
// 略
const { prevPost, nextPost } = Astro.props
---

// 前の記事（ある場合にのみ表示）
{prevPost.frontmatter && <a href={`/${prevPost.frontmatter.slug}/`}>{prevPost.frontmatter.title}</a>}

// 次の記事（ある場合にのみ表示）
{nextPost.frontmatter && <a href={`/${nextPost.frontmatter.slug}/`}>{nextPost.frontmatter.title}</a>}
```

## 前後の記事用のコンポーネントに渡す場合の作り方

実際の場合では、前後の記事用のコンポーネントを作って表示させることが殆どです。

コンポーネントとして、`prevNext.astro`を`component`フォルダー内に作ります。

<div class="filename">/src/components/prevNext.astro</div>

```js
---
const { prevPost, nextPost } = Astro.props
---

// 前の記事（ある場合にのみ表示）
{prevPost.frontmatter && <a href={`/${prevPost.frontmatter.slug}/`}>{prevPost.frontmatter.title}</a>}

// 次の記事（ある場合にのみ表示）
{nextPost.frontmatter && <a href={`/${nextPost.frontmatter.slug}/`}>{nextPost.frontmatter.title}</a>}
```

個別記事テンプレートの`[slug].astro`内でこのコンポーネントを読み込んで、プロパティーを渡します。

<div class="filename">/src/pages/[slug].astro</div>

```js
---
import PrevNext from "components/PrevNext.astro" // コンポーネント読み込み

// 略

const { prevPost, nextPost } = Astro.props
---

// コンポーネントにプロパティを渡す
<PrevNext {prevPost} {nextPost} />
```

あとはコンポーネントのデザイン等を整えればOKですね。
