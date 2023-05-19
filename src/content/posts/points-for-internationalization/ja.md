---
title: Next.js + Markdown + 多言語で作るサイトの設計方法
tags:
  - nextjs
  - internationalization
  - markdown
date: 2022-10-15T07:47:08.532Z
lastmod: 2022-10-27T06:56:17.685Z
draft: false
---

当サイト（route360.dev）構築の際、初めから多言語で構築を行った際の備忘録です。

「コンテンツはローカルにMarkdownファイルを保存する」という形式をとったため、ファイルの呼び出し+言語振り分けにやや苦労しました。

ヘッドレスCMSであれば、コンテンツ管理やページング（今回は解説せず）が楽でいいです。無料の選択肢の中では、2カ国語なら[Hygraph](https://hygraph.com/)、3カ国語以上は[Prismic](https://prismic.io/)が好感触でした。

<span class="label warning">関連記事</span> [多言語サイトを作る際、ヘッドレスCMSをどう選ぶか](/ja/post/cms-internationalization/)

動作環境：

- Node.js v16.18.0
- React v18.2.0
- Next.js v12.3.1
- prismjs v1.29.0

## next.jsの設定ファイルに、言語を追加しておく

すべての作業の前に、まずは`next.config.js`を開いて、利用する言語ロケールを設定します。

このブログでは【英語・フランス語・日本語】なので、設定は以下の通りです（デフォルト言語は英語）。

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
}

module.exports = nextConfig
```

上記記述は、パスがサブディレクトリ式になる設定です。

- デフォルト言語のURL：`example.com`
- それ以外の場合：`example.com/fr`や`example.com/ja`

サブドメイン式や、デフォルト言語をなしにする設定方法もあります。公式情報をチェックしてみてください。

<span class="label warning">参考</span> [Internationalized Routing | Next.js](https://nextjs.org/docs/advanced-features/i18n-routing)

❗この設定は、出力のための`next export`がサポートされません。Cloudflare Pagesなど`next export`がデプロイに必要な場合もありますので、ホスティングサービスの選定時にご注意ください。

### useRouter()で現在の表示言語が取得できる

`next.config.js`に追加したi18nの設定により、Next.jsの`useRouter()`で、フロント側で現在表示されている言語やデフォルトの言語等を取得できるようになります。

```js
import { useRouter } from "next/router"

export default function SomeComponent() {
  const { locale, defaultLocale, locales } = useRouter()
  return (
    <>
      <p>現在の言語は{locale}です</p>
      <p>デフォルトの言語は{defaultLocale}です</p>
      <p>設定されている言語は{locales.map(locale => `${locale}、`)}です</p>
    </>
  )
}
```

出力結果の例

```md
現在の言語はjaです
デフォルトの言語はenです
設定されている言語はen、fr、ja、です
```

これにより、コンポーネントやテンプレート内での内容の分岐が楽にできるようになります。

## Markdown投稿データの格納場所を考える

投稿データの管理方法は色々あると思いますが、当サイトでは以下のようにしています。

```tree
ROOT
├─ pages/
│    └─ ...
├─ posts/
│    ├─ first-post/
│    │    ├─ en.md
│    │    ├─ fr.md
│    │    └─ ja.md
│    ├─ second-post/
│    │    ├─ en.md
│    │    ├─ fr.md
│    │    └─ ja.md
```

- ディレクトリ（フォルダ）名 → スラッグとして利用
- ファイル名 → 言語名のみ

これは完全な個人的好みです。ディレクトリで管理せず、ファイル名を「`slug.lang.md`」（※）とするほうがいいという場合もあると思います。

※例：`first-post.en.md`、`first-post.ja.md`など

ファイルの場所やファイル名は、「投稿ページでのページ生成で、パスになる要素（スラッグなど）をどこから引っ張ってくるか」に関わってきます。

このエントリーの説明では、当サイトの「ディレクトリ名をスラッグに使う」方法になりますので、状況によって適宜変更してみてください。

## 投稿ページ

1つ目の難関は、投稿ページです。

ページ生成（パス生成）までは問題なくできても、「日本語では記事があるけれど英語ではまだ作っていない」という場合の取り扱いについて考える必要があります。

### ある記事の翻訳版がない場合

このサイト（route360.dev）では、すべてのスラッグについて各言語のページを作り、翻訳版がない場合は以下のようにしています。

- 「この記事はまだ○○語に翻訳されていません」と表示
- メタタグに`noindex`を追加する（[後述](#翻訳ファイルがないページ用にnoindex)）

作業的には、

1. パスの生成時、すべての言語について同じスラッグのページをいったん生成
2. ページコンテンツの生成時に、翻訳があるかないかで内容を振り分け

としています。

### パスの生成方法 - getStaticPaths

まずは、ページのパス（URL）を`getStaticPaths`で生成します。

今回は`/pages/`フォルダー内に`/post/`ディレクトリを作成し、その中に投稿ページのテンプレート`[slug].js`（※）を作りました。

※スラッグをパス（URL）のベースにする投稿テンプレート名で、生成されるパス（URL）は、`example.com/post/first-post/`のような形になる。

```tree
ROOT
├─ pages/
│    └─ post/
│         └─ [slug].js <--これ
├─ posts/
│    ├─ first-post/
│    │    ├─ en.md
│    │    ├─ fr.md
│    │    └─ ja.md
│    ├─ second-post/
│    │    ├─ en.md
│    │    ├─ fr.md
│    │    └─ ja.md
```

ファイル操作に関連するモジュールである`fs`と`path`をインポートしておきます（Node.jsに初めから入っているのでインストール不要）。

<div class="filename">/pages/post/[slug].js</div>

```js
import fs from "fs"
import path from "path"
```

ここから`getStaticPaths`を使ってパスを生成します。

1つの投稿につきすべての言語ロケールのURLを生成するため、`/pages/posts/`フォルダー内のすべてのディレクトリ名（=スラッグとして利用）を展開しながら、それぞれに言語ロケールの要素を追加した配列を作ります。

<div class="filename">/pages/post/[slug].js</div>

```js
//...

export async function getStaticPaths({ locales }) {
  // /posts/内のすべてのディレクトリ名を取得
  const dirnames = fs.readdirSync(path.join("posts"))
  // すべてのパスとロケールを格納する空の配列を用意
  const pathsArray = []

  //すべてのディレクトリ名について、すべての言語ロケール分のパス名を用意
  dirnames.map(dirname => {
    locales.map(language => {
      pathsArray.push({ params: { slug: dirname }, locale: language })
    })
  })

  return {
    paths: pathsArray,
    fallback: false,
  }
}
```

ここで生成される`pathArray`は、`console.log()`を使って確認すると、以下のようになります。

```js
;[
  { params: { slug: "first-post" }, locale: "en" },
  { params: { slug: "first-post" }, locale: "fr" },
  { params: { slug: "first-post" }, locale: "ja" },
  { params: { slug: "second-post" }, locale: "en" },
  { params: { slug: "second-post" }, locale: "fr" },
  { params: { slug: "second-post" }, locale: "ja" },
]
```

このデータを利用して、次の`getStaticProps`の中で`param`と`locale`のパラメータを使いながら.mdファイルを呼び出し、その.mdファイルの中身を取得してコンテンツを生成していきます。

### ページコンテンツデータの生成方法 - getStaticProps

コンテンツの生成の基本形は以下の形です。

<div class="filename">/pages/post/[slug].js</div>

```js
//...

// getStaticPathsで生成したparamsとlocaleを↓で受け取る
export async function getStaticProps({ locale, params: { slug } }) {
  // 1. ファイルを読み込み、中身を取得

  // 2. フロント側で利用するデータを返す
  return {
    props: {},
  }
}
```

今回は、.mdフォルダー内にタイトルや投稿日時などのメタデータをfrontmatterで用意しているので、それらのデータを扱うために[gray-matter](https://github.com/jonschlinkert/gray-matter)の`matter`をインポートします（要インストール）。

<div class="filename">/pages/post/[slug].js</div>

```js
import fs from "fs"
import path from "path"
import matter from "gray-matter" //<--これ
```

今から.mdファイルを取り込んで記事データを生成していきますが、「日本語では.mdファイルを作ったけれど、英語ではまだ同記事の.mdファイルがない」という場合、英語版のファイルを読み込もうとするとエラーになってしまいます。

ここでは、エラーを避けるために、javascriptの`try...catch`を利用します。

<span class="label warning">参考</span> [try...catch - JavaScript - MDN Web Docs](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/try...catch)

通常は`try`内の処理が行われ、エラー時（ここでは翻訳記事を用意していない場合）は`catch`内の処理が行われます。

翻訳ファイルが存在しないため読み込めず`catch`処理になった場合、ここでは仮のコンテンツとして空の`title`を返すようにしています。あとでフロント側でのコンテンツ出力時に、`title`の有無で表示内容を分岐するためです。

<div class="filename">/pages/post/[slug].js</div>

```js
//...

// getStaticPathsで生成したparamsとlocaleを↓で受け取る
export async function getStaticProps({ locale, params: { slug } }) {
  // 1. ファイルを読み込み、中身を取得
  try {
    // 2-A. フロント側で利用するデータを返す
    return {
      props: {},
    }
  } catch (e) {
    // 2-B. 翻訳がない場合は、空のタイトルのみを返す
    return {
      props: {
        frontmatter: {
          title: "",
        },
        // content: 'No content!',
      },
    }
  }
}
```

`try`の中身は、こんな感じにしてみました（上記コード続き）

<div class="filename">/pages/post/[slug].js</div>

```js
//...

export async function getStaticProps({ locale, params: { slug } }) {
  try {
    // 1-1. ファイルを読み込み、中身を取得
    const markdownWithMeta = fs.readFileSync(
      path.join('posts/' + slug + `/${locale}.md`),
      'utf-8'
    )
    // 1-2. frontmatterデータ（メタデータ）と本文を取得
    const { data: frontmatter, content } = matter(markdownWithMeta)

    // 2-A. フロント側で利用するデータを返す
    return
      {
        props: {
          frontmatter: JSON.parse(JSON.stringify(frontmatter)),
          content,
        },
      }
  } catch (e) {
    //...
  }
}
```

余談：当ブログでは、frontmatterのデータが`draft: true`の場合はデータが生成されないよう、`try`内でさらに分岐させています。

### フロント側での表示用出力

これで`frontmatter`（メタデータ）と`content`（Markdown本文）をフロント側で取得できるようになったので、これらを実際のデータ表示部分で使えばOK。イメージとしては、ざっくり以下のようなコードになります。

<div class="filename">/pages/post/[slug].js</div>

```js
//...

export default function Post({ frontmatter: { title, date }, content }) {
  return (
    <>
      <h1>{title}</h1>
      <article dangerouslySetInnerHTML={{ __html: marked(content) }} />
      {/* markedを使い、Markdownをhtmlに変換 */}
    </>
  )
}
```

さらに、翻訳ファイルがない場合は「翻訳がない旨」が表示がされるように、`title`の有無で表示を分岐させます。

言語によって「翻訳がない旨」の文章を変えるため、ここでは`useRouter()`を使い現在の表示言語`locale`を取得して、言語別の分岐を入れています。

<div class="filename">/pages/post/[slug].js</div>

```js
//...
import { useRouter } from 'next/router'

export default function Post({
  frontmatter: { title, date },
  content,
}) {
  const { locale } = useRouter() {/*現在の言語ロケールを取得 */}
  return title !== '' ? (
    <>
      <h1>{title}</h1>
      <article dangerouslySetInnerHTML={{__html: marked(content)}} />
    </>
  ) : (
    <>{/* 翻訳がない場合の表示ここから */}
      <h1>Sorry!</h1>
      {locale === 'ja' && (
        <p>この記事はまだ日本語に訳せておりません。ごめんなさい。</p>
      )}
      {locale === 'fr' && (
        <p>Pardonnez-moi, cet article n&#39;est pas encore disponible en français.</p>
      )}
      {locale === 'en' && (
        <p>Sorry, this entry is not available yet in English.</p>
      )}
    </>
  )
}
```

実際の場面ではコンポーネントを使う場合が殆どだと思いますので、表示方法は状況に応じてアレンジしてください。

### 日付表示

日付の表示方法は、地域や言語によってもかなり異なります。

当サイトで設定している英語・仏語・日本語の表示は、以下のようになっています。

- 英語：Sep 30, 2022
- 仏語：le 30 sept. 2022
- 日本語：2022-9-27

これを実現するため、日付変換用のコンポーネントを作り、言語別に日時データを整形するようにしています。

変換用に利用しているモジュールは[date-fns](https://github.com/date-fns/date-fns)です（要インストール）。

<div class="filename">/components/convert-date.js</div>

```js
import { parseISO, format } from "date-fns"
import ja from "date-fns/locale/ja"
import en from "date-fns/locale/en-US"
import fr from "date-fns/locale/fr"
import { useRouter } from "next/router"

export default function ConvertDate({ dateISO }) {
  const { locale } = useRouter()
  return (
    <time dateTime={dateISO}>
      {locale === "ja" && format(parseISO(dateISO), "yyyy-M-d", { locale: ja })}
      {locale === "en" &&
        format(parseISO(dateISO), "MMM d, yyyy", { locale: en })}
      {locale === "fr" &&
        format(parseISO(dateISO), "d MMM yyyy", { locale: fr })}
    </time>
  )
}
```

`date-fns`から言語別の設定用データをインポートし、現在表示中の言語ロケールによって出力結果を変更。

日時変換コンポーネントは`[slug].js`内等で読み込んで、日付データを渡します。

<div class="filename">/pages/post/[slug].js</div>

```js
//...
import ConvertDate from "components/convert-date"

export default function Post({ frontmatter: { title, date }, content }) {
  return title !== "" ? (
    <>
      <h1>{title}</h1>
      <ConvertDate dateISO={date} /> {/* <--これ */}
      <article dangerouslySetInnerHTML={{ __html: marked(content) }} />
    </>
  ) : (
    {
      /* 翻訳がない場合の表示 */
    }
  )
}
```

### コメント欄

当サイトのコメント欄は、GitHubのディスカッションを利用した[giscus](https://giscus.app/ja)です。

言語別表示の出力が可能なので、これも表示中の言語ロケールによって切り替わるようにします。

<div class="filename">/components/comments.js</div>

```js
import Giscus from '@giscus/react'
import { useRouter } from 'next/router'

export default function Comments() {
  const { locale } = useRouter() {/* <-- 現在のロケールを取得 */}
  return (
    <Giscus
      repo="[リポジトリを記述]"
      repoId="[リポジトリIDを記述]"
      category="[カテゴリ名を記述]"
      categoryId="[カテゴリIDを記述]"
      mapping="title"
      reactionsEnabled="1"
      emitMetadata="1"
      theme="preferred_color_scheme"
      lang={locale} {/* <-- ここで言語設定 */}
      crossOrigin="anonymous"
    />
  )
}
```

その他の設定項目の詳細は、[giscus公式](https://giscus.app/ja)参照。

当サイトの場合、上記Giscusコンポーネントに遅延ローディングを追加したら、同記事の言語切り替えで再読込エラーが出て言語切り替えが効かなかったため、`loading="lazy"`は指定していません（今後の課題その1🙁）。

## 一覧ページ

記事一覧ページでも、「日本語では記事があるけれど、まだ英語では作っていない」場合の表示について留意する必要があります。

当サイトはブログ形式にしているので、トップページにあたる`index.js`を記事一覧ページに使っています。もちろんトップページではなく、`/pages/post/index.js`等に作ってもOKです。

一覧ページは[動的ルーティング](https://nextjs-ja-translation-docs.vercel.app/docs/routing/dynamic-routes)の必要がないため、先ほどの投稿記事のようにパスを生成する`getStaticPaths`必要はありません。ここで必要なのは表示内容を決める`getStaticProps`のみです。

### 一覧ページのコンテンツデータの生成方法 - getStaticProps

気をつけるポイントは、基本的には投稿ページを作った時と同じです。

存在しない翻訳ファイルを読み込もうとしてエラーになる可能性があるため、ここでも`try...catch`を使います。

<div class="filename">/pages/index.js</div>

```js
export async function getStaticProps({ locale }) {
  const dirnames = fs.readdirSync(path.join('posts'))

  const data = dirnames
    .map((dirname) => {
      try {
        // すべての投稿ファイルを取得
        const markdownWithMeta = fs.readFileSync(
          path.join('posts/' + dirname + `/${locale}.md`),
          'utf-8'
        )
        const { data: frontmatter, content } = matter(markdownWithMeta)
        return (
          slug: dirname,
          frontmatter,
          content
        )
      } catch (e) {
        // console.log(e.message)
      }
    })
    // エラーでundefinedとして生成された投稿は排除しておく
    .filter((e) => e)

  const posts = JSON.parse(JSON.stringify(data))

  return {
    props: {
      posts: posts
    },
  }
}
```

これで言語別に必要な記事一覧が取得できましたが、並び順がディレクトリ名順になってしまいます。

日付順にするため、並べ替えの関数を作ります。関数はユーティリティ用フォルダーに作成しました。

<div class="filename">/utils/index.js</div>

```js
export const sortByDate = (a, b) => {
  return new Date(b.frontmatter.date) - new Date(a.frontmatter.date)
}
```

これを`/pages/index.js`内でインポートし、`return`内の`posts`へ付け加えてソートさせます。

<div class="filename">/pages/index.js</div>

```js
//...
import { sortByDate } from 'utils'

export async function getStaticProps({ locale }) {
  //...

  return {
    props: {
      posts: posts.sort(sortByDate) {/* <-- これ */}
    },
  }
}
```

<span class="label warning">参考</span> [Static Blog With Next.js and Markdown - Traversy Media | YouTube](https://www.youtube.com/watch?v=MrjeefD8sac)

これで日付順の並べ替えは完成です。

※今回はページネーションの方法は省きますが、ここまでできる方なら問題なくできるでしょう・・・

## 独立した固定ページ

[動的ルーティング](https://nextjs-ja-translation-docs.vercel.app/docs/routing/dynamic-routes)を行わない固定ページの多言語化は、当サイトでは、冒頭で説明した`useRouter()`から取得できる現在の表示言語 `{ locale }`による分岐を使っています。

たとえば、ABOUTページ`/pages/about.js`ではこのような感じです。

<div class="filename">/pages/about.js</div>

```js
import { useRouter } from "next/router"

export default function About() {
  const { locale } = useRouter()
  return (
    <article>
      {locale === "en" && (
        <p>Hi! I&#39;m Mayumi (she/her). Thanks for visiting my website.</p>
      )}
      {locale === "fr" && (
        <p>Coucou ! Je suis Mayumi (elle). Merci pour visiter mon site web.</p>
      )}
      {locale === "ja" && (
        <p>こんにちは、Mayumiです。サイトをご覧下さりありがとうございます。</p>
      )}
    </article>
  )
}
```

もちろん、内容が長くなりそうな場合は、コンテンツ用ファイルを別に作って言語別に読み込んでもかまいません。

## 言語バー

サイト上部の言語バーは、言語バー用コンポーネントを作っています。※下記コードはClassNameなどスタイルは省いています。

<div class="filename">/components/language-switcher.js</div>

```js
import Link from "next/link"
import { useRouter } from "next/router"

export default function LanguageSwitcher() {
  const { locales, asPath } = useRouter()
  return (
    <ul>
      {locales.map(lang => (
        <li key={lang}>
          <Link href={asPath} locale={lang} hrefLang={lang} rel="alternate">
            <a>{lang.toUpperCase()}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

1. `const { locales } = useRouter()`でnext.config.jsに設定したすべての言語を取得し、それを`map()`で展開。
2. リンク先hrefには、`const { asPath } = useRouter()`で取得した、同スラッグの他の言語へのリンクを付与。

これにより、たとえば英語の`/about/`ページを開いている時には、仏語リンクは`/fr/about/`に、日本語リンクは`/ja/about/`に、自動で出力がされます。

## メタデータの出力

もっとも腐心した部分の1つが、SEO対応のためのメタデータ出力です。

ここでは具体的なコードは書きませんが、私が行ったことを記述します。

### 言語別に変換したメタデータ

```html
<!-- 出力結果 -->
<title>"[言語別タイトル]"</title>
<link rel="canonical" href="[言語別URL]" />
<meta name="description" content="[言語別デスクリプション]" />
<meta property="og:title" content="[言語別タイトル]" />
<meta property="og:description" content="[言語別デスクリプション]" />
<meta property="og:url" content="[言語別URL]" />
<meta property="og:site_name" content="[言語別のサイトタイトル]" />
<meta property="og:locale" content="[表示言語]" />
```

### Googleのローカライズガイダンスに従ったメタデータ

```html
<!-- 出力結果 -->
<link rel="alternate" hreflang="en" href="[現在のページの英語版]" />
<link rel="alternate" hreflang="fr" href="[現在のページの仏語版]" />
<link rel="alternate" hreflang="ja" href="[現在のページの日本語版]" />
<link
  rel="alternate"
  hreflang="x-default"
  href="[現在のページのデフォルト言語版]"
/>
```

<span class="label warning">参考</span> [ページのローカライズ版 | Google 検索セントラル](https://developers.google.com/search/docs/specialty/international/localized-versions)

### 言語別に作ったSchema

リッチリザルト用のSchema（スキーマ）は、各テンプレート（`/pages/post/[slug].js`など）内で生成し、Metaコンポーネントへ送るという形を取っています。

```html
<!-- 出力結果 -->
<script type="application/ld+json">
  [言語別のスキーマ]
</script>
```

### 翻訳ファイルがないページ用にnoindex

同じ記事の翻訳版がない場合、何もコンテンツがないページが検索エンジンに登録されないようにしておきます。

```html
<!-- 出力結果/翻訳がない場合 -->
<meta name="robots" content="noindex,nofollow" />
```

先ほどの[フロント側での表示用出力](#フロント側での表示用出力)では、翻訳がない投稿ページの表示を分岐させました。その「翻訳がないページの場合」にのみ、Metaコンポーネントへ`noIndex`要素を送るようにしています。

<div class="filename">/pages/post/[slug].js</div>

```js
//...
import Meta from "/components/meta"

export default function Post({ frontmatter: { title, date }, content }) {
  return title !== "" ? (
    <>
      <Meta /> {/* 通常のmeta */}
      <h1>{title}</h1>
      <article dangerouslySetInnerHTML={{ __html: marked(content) }} />
    </>
  ) : (
    <>
      {/* 翻訳がない場合の表示ここから */}
      <Meta noIndex /> {/* 翻訳がない場合はnoIndexをMetaコンポーネントへ送る */}
      <h1>Sorry!</h1>
      {locale === "ja" && (
        <p>この記事はまだ日本語に訳せておりません。ごめんなさい。</p>
      )}
      {locale === "fr" && (
        <p>
          Pardonnez-moi, cet article n&#39;est pas encore disponible en
          français.
        </p>
      )}
      {locale === "en" && <p>Sorry, this entry is not available yet in English.</p>}
    </>
  )
}
```

Metaコンポーネント側ではこうです。

<div class="filename">/components/meta.js</div>

```js
//...
export default function Meta({ noIndex = false }) {
  //...
  return (
    //...
    {noIndex && <meta name="robots" content="noindex,nofollow" />}
    //...
  )
}
```

翻訳記事がない場合は、Google用の[Googleのローカライズガイダンスに従ったメタデータ](#メタデータの出力)も出力しないほうがいいとは思うのですが、そこまで分岐できていません（今後の課題その2🙁）。

## サイトマップ

Next.jsにはサードパーティーによるサイトマップ自動生成モジュールがいくつかありますが、残念ながら多言語に対応していません（筆者調べ）。

そのため、記事を付け加える毎に今のところは手入力しています😱。Pythonなどで自動化したいところです（モジュールを作れるほどの技量はない・・・）

<span class="label warning">参考</span> [ページのローカライズ版 | Google 検索セントラル](https://developers.google.com/search/docs/specialty/international/localized-versions)

これを読むと、多言語サイトの場合のサイトマップは単言語のサイトよりもずっと煩雑なことがわかります。

せっかく海外の人にもアピールできるサイトを作っているので、検索エンジンにもしっかり理解されるように準備したいところです。

## RSSフィード

RSSフィードは、言語毎に分けています。

- feed.en.xml
- feed.fr.xml
- feed.ja.xml

フィード生成には、Node.js用パッケージの[feed](https://github.com/jpmonette/feed)を使用。

## その他調整したこと

### Prism.jsの読み込み

シンタックスハイライトのPrism.jsの読み込みは、以下のようにしています。

<div class="filename">/pages/post/[slug].js</div>

```js
const { locale, asPath } = useRouter()

useEffect(() => {
  Prism.highlightAll()
}, [locale, asPath])
```

多くの参考サイトでは、第2引数（ここでは`[locale, asPath]`）を指定していませんでしたが、記事を別言語に切り替える際にPrism.jsが効かないことがあるため、ページ遷移で必ず再読み込みされるように第2引数を指定しました。

※`const { events } = useRouter()`で`events`を第2引数にもしてみましたが、何故か言語切り替えでうまく動きませんでした。

## 多言語でブログを作った感想（まとめ）

率直に申し上げると、多言語サイトは想像以上にやることが多過ぎました。翻訳だけでも大変なのに、構築に気軽に手を出すもんじゃありません。

今回の設計方法では翻訳がない場合でもページ生成を行っていますので、SEO的に記事はすべての翻訳版も揃えた上で公開するほうが良いですね。「翻訳版がない場合」の表示方法は、応急処置です。

当サイトのコードは他にも色々な要素を入れているので、実際はもう少し複雑です。現在は試運転段階なので、落ち着いたら公開したいですね。
