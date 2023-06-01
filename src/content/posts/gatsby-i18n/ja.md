---
title: Gatsby.js + Markdown で多言語ブログを作成する方法
tags:
  - gatsbyjs
  - internationalization
  - markdown
date: 2023-05-18T01:00:00.000Z
lastmod: 2023-06-01T05:26:51.618Z
draft: false
---

当サイトはGatsby.jsで作られた、3か国語の多言語ブログです。**i18n用のプラグインなどは使用せず**、gatsby-node.jsによるルーティングのみで実現させています。※2023年4月まではNext.jsでした。

Gatsby.jsには、Next.jsの`useRouter()`のように、自動でデフォルト言語や現在の表示言語を取得できる機能がありません。また、そもそも、「デフォルト言語とその他の言語」といった設定や区別もありません。

この記事では、私がこのサイトをどのようにして多言語（国際化/i18n）へ対応にしたか、手順とポイントを紹介します。他にも方法はあるとは思いますが、1つの例としてお読みください。

なお、このブログのコードは[GitHubリポジトリで公開](https://github.com/mayumih387/route360)しています。

## Gatsby.jsでの多言語サイト作りのポイント

1. `gatsby-node.js`で言語別にページを生成する
2. 1の際に、現在の言語を`pageContext`に渡しておく
3. 各テンプレート内で、`pageContext`から現在の言語を取得し、ヘッダーやフッターなどのコンポーネントに渡して、言語別に表示を分ける

このようにすれば、i18n用のプラグインなどは不要で、Gatsby.jsでも多言語サイトが作れます。

## Markdownファイルの構成

Markdownファイルは、以下の配置となっています。

```tree
src/
├─ content/
| └─ posts/
|    ├─ first-post/
|    |    ├─ en.md
|    |    ├─ fr.md
|    |    └─ ja.md
|    ├─ second-post/
|    |    ├─ en.md
|    |    ├─ fr.md
|    |    └─ ja.md
```

フォルダー名をスラッグとして、言語別に`[lang].md`とファイル名をつけています。こうすることで、frontmatterメタデータや各ファイル名にスラッグと言語コードを付与する手間を省いています。

そのため`gatsby-node.js`には、それぞれの投稿（MarkdownRemark）のGraphQLクエリでファイル名と言語を取得できるように、以下の記述をして`slug`と`language`スキーマを追加しておきます。

<div class="filename">gatsby-node.js</div>

```js
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === "MarkdownRemark") {
    const fileNode = getNode(node.parent)

    createNodeField({
      node,
      name: "language",
      value: fileNode.name,
    })

    createNodeField({
      node,
      name: "slug",
      value: fileNode.relativeDirectory.match(/\/(.+)/)[1],
    })
  }
}
```

リンク - [onCreateNode | Gatsby.js](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#onCreateNode)

上記コードにより、GraphQLのクエリから各投稿のスラッグと言語名を取得できるようになります。もちろん、フィルタリングやソート（並び替え）にも使えます。

```graphql
query {
  markdownRemark {
    fields {
      language
      slug
    }
    frontmatter {
      ...
    }
  }
}
```

## 言語別パスの作り方とページ生成

次に、`gatsby-node.js`で、作りたいページのパスを作っていきます。

面倒ですが、クエリは言語別に生成します。

- 個別記事のテンプレート名: post.js
- トップページ（全記事）のテンプレート名: index.js

言語別にクエリを生成することで、以下の恩恵が受けられます。

- それぞれの言語の投稿数が異なる場合、ページングがしやすくなる
- 前後の記事が言語別で取得できるようになる

### 個別記事ページの生成

<div class="filename">gatsby-node.js</div>

```js
exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const blogresult = await graphql(`
    query {
      allPostsEN: allMarkdownRemark(
        filter: { fields: { language: { eq: "en" } } }
        sort: { frontmatter: { date: DESC } }
      ) {
        edges {
          node {
            id
            fields {
              slug
            }
          }
        }
      }
      allPostsFR: allMarkdownRemark(
        filter: { fields: { language: { eq: "fr" } } }
        sort: { frontmatter: { date: DESC } }
      ) {
        edges {
          node {
            id
            fields {
              slug
            }
          }
        }
      }
      allPostsJA: allMarkdownRemark(
        filter: { fields: { language: { eq: "ja" } } }
        sort: { frontmatter: { date: DESC } }
      ) {
        edges {
          node {
            id
            fields {
              slug
            }
          }
        }
      }
    }
  `)

  if (blogresult.errors) {
    reporter.panicOnBuild(`Query error!`)
    return
  }

  // Single Post Pages
  const allPosts = {
    en: blogresult.data.allPostsEN,
    fr: blogresult.data.allPostsFR,
    ja: blogresult.data.allPostsJA,
  }

  Object.keys(allPosts).forEach(key => {
    allPosts[key].edges.forEach(({ node }) => {
      createPage({
        path: `/${key}/post/${node.fields.slug}/`,
        component: require.resolve(`./src/templates/post.js`),
        context: {
          id: node.id,
          slug: node.fields.slug,
          language: key,
        },
      })
    })
  })
}
```

ここではページングの説明は割愛しますが、投稿総数が言語により異なる可能性も考慮しています。

一覧ページで「日本語では5ページ目があるけど英語では4ページまでしかない」と行った場合、言語別でクエリを取っておけば、ムダなページを作らなくて済みます。

### 記事一覧ページの生成

続けて、このブログのトップページのように、記事の一覧ページを作るためのコードを追加します。

<div class="filename">gatsby-node.js</div>

```js
exports.createPages = async ({ actions, graphql, reporter }) => {
  //...

  // Index Pages
  Object.keys(allPosts).forEach(key => {
    createPage({
      path: `/${key}/`,
      component: require.resolve(`./src/templates/index.js`),
      context: {
        language: key,
      },
    })
  })
}
```

参考までに、ページング機能を入れている当ブログでは、以下のようにしています（[リポジトリはこちら](https://github.com/mayumih387/route360/blob/main/gatsby-node.js)）。

<div class="filename">gatsby-node.js</div>

```js
exports.createPages = async ({ actions, graphql, reporter }) => {
  // add totalCount query to const blogresult

  const postsPerPage = 5
  // Index Pages
  Object.keys(allPosts).forEach(key => {
    const totalPages = Math.ceil(allPosts[key].totalCount / postsPerPage)
    for (let i = 0; i < totalPages; i++) {
      createPage({
        path: i === 0 ? `/${key}/` : `/${key}/page/${i + 1}/`,
        component: require.resolve(`./src/templates/index.js`),
        context: {
          language: key,
          skip: postsPerPage * i,
          limit: postsPerPage,
          currentPage: i + 1, //current page number
          isFirst: i + 1 === 1, //if it's the first page
          isLast: i + 1 === totalPages, //if it's the last page
          pages: totalPages,
        },
      })
    }
  })
}
```

## 現在の表示言語と翻訳記事の判定方法

ここでは、個別投稿記事ページでの作成について説明します。記事一覧ページでも同じコンセプト（表示言語の取得）で作成できます。

### 表示言語の取得

先ほどの`gatsby-node.js`のページ生成で、`context`プロパティに`language`を追加し、言語コードを値として送るようにしました。

これらはテンプレート内で`pageContext`として、データの取得が可能となります。

<div class="filename">src/template/post.js</div>

```js
const SinglePost = ( { pageContext } ) => {
  const currentLang = pageContext.language

  return (
    //...
  )
}
```

この値を各コンポーネントに送れば、ヘッダーやフッターでの言語別表示の切り替えに使えます。

### 翻訳記事の有無の確認

現在表示中の記事の翻訳があるかどうかを、これもテンプレート内で確認します。

`gatsby-node.js`のページ生成で、生成したページのスラッグを`context`プロパティに含めていますので、スラッグが一致する投稿を`allMarkdownRemark`から取得。

取得したクエリをjsx内で`map()`により展開し、定数名`availLangs`に配列として格納します。

<div class="filename">src/template/post.js</div>

```js
const SinglePost = ( { pageContext, data } ) => {
  const currentLang = pageContext.language

  const availLangs = data.allMarkdownRemark.nodes.map(
    node => node.fields.language
  )

  return (
    //...
  )
}

export const query = graphql`
  query($id: String!, $slug: String!) {
    markdownRemark(id: { eq: $id }) {
      ... // 現在の投稿のデータ
    }
    allMarkdownRemark(
      filter: { fields: { slug: { eq: $slug } } }
      sort: { fields: { language: ASC } }
    ) {
      nodes {
        id
        fields {
          language
        }
      }
    }
  }
`
```

こうすることで、`availLangs`を言語スイッチャーコンポーネントに送り、翻訳がある場合にのみスイッチャーにリンクを表示させます。

※言語スイッチャーの作成についてはここでは割愛。

### Gatsby Head APIで、htmlタグにlang属性を追記

Gatsby.jsでは、各テンプレートで`Gatsby Head API`を使うことで、`<html>`や`<body>`タグへ動的（ダイナミック）なデータを送ることができます。

テンプレートのJSXで記述した際と同様に、`pageContext`から現在の言語を取得して、`<html>`タグの言語属性を指定。

<div class="filename">src/template/post.js</div>

```js
export const Head = ({ pageContext }) => {
  const currentLang = pageContext.language

  return <html lang={currentLang} />
}
```

リンク - [Gatsby Head API](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/)

### 記事一覧ページの場合

トップページやタグページなど、記事一覧のページの場合も、`gatsby-node.js`で現在の表示言語を`context`プロパティに渡しているので、上記の考え方で同じように作れます。

## トップページと404ページの言語別表示

### トップページへのリダイレクト処理

各言語のトップページは、先ほどの`gatsby-node.js`で言語別に作成しましたが、ルートドメインの処理が必要です。

Next.jsで作っていた時は、`https://route360.dev/`は英語のトップページにしていたので、このURLにアクセスがあった場合は`https://route360.dev/en/`へリダイレクトされるようにしました。

ホスティングは[Cloudflare Pages](https://www.cloudflare.com/ja-jp/products/pages/)です。リダイレクト用ファイルは以下のようにしています。[Netlify](https://www.netlify.com/)でも同様の設定でいけるはずです。

<div class="filename">src/static/_redirects</div>

```text
/ /en 301
```

### 404ページの表示方法

404ページは、Cloudflare Pagesではカスタムリダイレクトがサポートされていない（Netlifyでは可）ため、以下のようにしています（以下は、実際のコードを説明用に加工）。

<div class="filename">src/pages/404.js</div>

```js
const NotFoundPage = ({ location }) => {
  const browserLang = location.pathname.slice(1, 3)

  const languageMap = {
    ja: "ja",
    fr: "fr",
    en: "en",
  }

  const backToHome = {
    en: "Back to Home",
    fr: "Retour à la page d'accueil",
    ja: "ホームに戻る",
  }

  let currentLang = languageMap[browserLang] || languageMap["en"]

  return (
    <Layout currentLang={currentLang}>
      <div className={classes.postsContainer}>
        <p>404 Not Found</p>
        <Link to={`/${currentLang}/`}>{backToHome[currentLang]}</Link>
      </div>
    </Layout>
  )
}
```

現在表示されている404ページのパスに`/en/`などの言語コードが含まれている場合、その言語に合った「ホームに戻る」を表示。含まれていない場合は英語で表示するようにしています。

※上記の判定では、パスが「length」など、2文字目と3文字目がenなら「英語」と判定されてしまいますので、気になる方はもっと判定を厳格にしてください。

## ヘッダーの言語別メタタグの実装（SEO対策）

SEO対策のため、翻訳ページがある場合は`<head>`タグ内に翻訳の有無やデフォルト言語ページに関するコードを追加します。

当サイトでは、Gatsby Head APIを通じてSEOコンポーネント内に`availLangs`データを送り、翻訳がある場合にのみ以下のデータを追加しています。

### ページのローカライズ版についてGoogleに知らせる

```html
<link rel="alternate" hreflang="言語コード" href="現在のURL" />
```

詳しくはGoogle公式の「[hreflangでページの言語・地域を知らせる](https://developers.google.com/search/docs/specialty/international/localized-versions?hl=ja#html)」にガイドがあるので、それにしたがってメタデータを追加します。

### OGP（Open Graph Protocol）用のメタデータ

```html
<meta property="og:locale:alternate" content="言語コード" />
```

同様に、OGP用にもメタデータを追加します。

## 言語別のRSSフィードの作成

[gatsby-plugin-feed](https://www.gatsbyjs.com/plugins/gatsby-plugin-feed/)を利用して、言語別にRSSフィードを生成します。

詳しい言語別フィードの作成方法は、以下のエントリーで紹介しています。

[Gatsby.js + 多言語サイトの、言語別RSSフィードの作成方法](/ja/post/gatsby-i18n-feed)

## 多言語サイト用サイトマップの生成

Gatsby.js純正の`gatsby-plugin-sitemap`でサイトマップが作れますが、そのままでは多言語に対応されないため、カスタマイズが必要です。

詳しいサイトマップの作成方法は、以下のエントリーで紹介しています。

[多言語Gatsby.jsサイトのサイトマップ作成とカスタマイズの手順](/ja/post/gatsby-i18n-sitemap)

## まとめ

`gatsby-node.js`のパス作成を上手く使えば、i18n用の特別なプラグインを使わなくてもGatsby.jsで多言語サイト・国際化は問題なくできました。

Astroで多言語サイトを作った際に、もともと多言語展開されているAstroの公式ドキュメントの作りをGitHubで確認したことが役に立ちました。

右から左に読む言語（アラビア語など）も、言語でレイアウトコンポーネントを振り分けすれば良さそうです。

以上です。
