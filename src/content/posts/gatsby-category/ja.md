---
title: Gatsby.js + Markdownブログで、カテゴリー機能を実装する方法
tags:
  - jamstack
  - markdown
  - gatsbyjs
date: 2023-01-07T15:00:00.000Z
lastmod: 2023-02-23T06:55:52.059Z
draft: false
---

ヘッドレスCMSを使っていればカテゴリーやタグの管理は楽ですが、Markdownの場合は一工夫必要です。

英数字のみのカテゴリーであればそこまで難しくありませんが、日本語の場合は「カテゴリー名は日本語、スラッグは英数字」というパターンも多いと思います。

また、SEO対策で、メタタグにそれぞれ工夫したディスクリプションをカテゴリー毎に用意したい場合もあるでしょう。

そういった場合に対応した、カテゴリーの管理方法とカテゴリーページの作り方です。もちろんタグページにも使えます。

動作環境：

- Node.js v18.12.1
- React v18.2.0
- Gatsby.js v5.6.0
- gatsby-transformer-json v5.6.0

## カテゴリー用jsonファイルを作る

今回、カテゴリーはjsonファイルで管理します。ファイルは`src`フォルダ下に`data`フォルダを作り、その中に入れています。

※jsファイルでも可。その場合はgatsby-transformer-jsonは不要。

<div class="filename">/src/data/category.json</div>

```js
[
  {
    "title": "コメディー",
    "slug": "comedy",
    "description": "コメディー映画の記事一覧です。コメディーと言えば私の中では三谷幸喜「ラヂオの時間」、当時映画館で爆笑しながら見ました。"
  },
  {
    "title": "ホラー",
    "slug": "horror",
    "description": "ホラー映画の記事一覧です。現実の私はホラー映画は見ませんが。"
  },
  {
    "title": "加山雄三",
    "slug": "kayamayuzo",
    "description": "加山雄三さん出演の映画一覧です。永遠の若大将、これからも元気でいてほしいです！"
  }
]
```

こんな感じで、カテゴリーを作っておきます。もちろん、他のデータを追加してもかまいません。

タグの場合も同様にしてデータを用意して使い回せます。

## Markdown記事内での管理

Markdown記事内では、メタデータはYAML Frontmatterを使って管理。その中で、記事が属するカテゴリーとして、カテゴリーの`slug`を付与します。

<div class="filename">/content/posts/funny-10-movies.md</div>

```md
---
title: 腹筋崩壊！涙を流して笑える、コメディー映画10選
slug: funniest-10-movies
category:
  - comedy
date: 2022-10-11
---

本文あれやこれや
```

上記の例ではカテゴリー「comedy」を指定しています。カテゴリーは複数でも問題ありません。

## gatsby-transformer-jsonをインストール

次に、GraphQLでカテゴリーデータを取得するため、公式プラグインの[gatsby-transformer-json](https://www.gatsbyjs.com/plugins/gatsby-transformer-json/)をインストールします。

```bash
# npmの場合
npm install gatsby-transformer-json

# yarnの場合
yarn add gatsby-transformer-json
```

更に、`gatsby-config.js`にプラグインの追加と、`gatsby-source-filesystem`でjsonファイルのディレクトリを追加しておきます。

<div class="filename">/gatsby-config.json</div>

```js
module.exports = {
　//...

  plugins: [
    //...
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data/`,
      },
    },
  ]
}
```

これで、カテゴリーデータのクエリ`CategoryJson`を、GraphQLで取得出来るようになります。

## Frontmatterのカテゴリーslugと、CategoryJsonのデータを紐付ける

この時点ではまだ、Frontmatterで記事に追加したカテゴリーと、`CategoryJson`のデータは紐付いていません。紐付けに使えるのは、`CategoryJson`の`slug`ですね。

Frontmatterのカテゴリーに指定された文字列と一致する`CategoryJson`の`slug`を紐付けて、Frontmatterのカテゴリーからカテゴリーのタイトルなどを取得出来るようにします。

`gatsby-node.js`にコードを追加。

<div class="filename">/gatsby-node.js</div>

```js
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
  type MarkdownRemark implements Node {
    frontmatter: Frontmatter
  }
  type Frontmatter implements Node {
    category: [CategoryJson] @link(by: "slug")
  }
  `
  createTypes(typeDefs)
}
```

`createSchemaCustomization`は、元来別々のNodeどうしに関連付けを行うためのAPIです。

<span class="label warning">参考</span> [Create foreign key relationships between data - Creating a Source Plugin | Gatsby](https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/creating-a-source-plugin/#create-foreign-key-relationships-between-data)

これで、Frontmatterのカテゴリー`slug`と、`category.json`の`slug`が結びつき、GraphQLで記事スキーマの中にカテゴリー情報が追加されます。

<div class="filename">Before: GraphQL</div>

```graphql
query MyQuery {
  markdownRemark {
    frontmatter {
      category
    }
  }
}
```

<div class="filename">After: GraphQL</div>

```graphql
query MyQuery {
  markdownRemark {
    frontmatter {
      category {
        id
        title
        slug
      }
    }
  }
}
```

## カテゴリーページのパスを生成

ここからは、カテゴリーページのパス（URL）を作っていきます。`gatsby-node.js`の出番です。

ポイントは、クエリ取得に`categoryJson`は使わない点。

というのは、`category.json`の中に用意されたカテゴリーが全て、必ずしも記事で使われているかはわからないためです。使っていないカテゴリーがある場合、そのカテゴリーページのパスが生成されても困りますよね。

そのため、ここでは`allMarkdownRemark`から、カテゴリーのグループを利用します。GatsbyのGraphQLは、これがあるから便利なんですよね～😺

<span class="label warning">参考</span> [Group - GraphQL Query Options | Gatsby](https://www.gatsbyjs.com/docs/graphql-reference/#group)

記事のFrontmatterに存在するカテゴリーの`slug`だけが抽出されるので、「`categoryJson`にはあるけれど、実際は記事に使われていないカテゴリー」のパスは生成されません。

これを踏まえて、まずはクエリ追加。

<div class="filename">/gatsby-node.js</div>

```js
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const blogresult = await graphql(`
    query {
      allMarkdownRemark{
        group(field: { frontmatter: { category: SELECT } }) {
          fieldValue
          totalCount
        }
        ...その他色々
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`)
    return
  }

  // 以下に続く
}
```

この後に、`createPage`でページパスの生成をします。

パス生成時には、コンテキストとしてカテゴリーのスラッグ（ここでは`$cat_slug`）を用意、テンプレート側で受け取れるようにします。

<div class="filename">/gatsby-node.js</div>

```js
  // 上記コードの続き

  const catPostPerPage = 10 // 1ページあたりの記事数
  blogresult.data.allMarkdownRemark.group.forEach((node) => {
    const catPosts = node.totalCount
    const catPages = Math.ceil(catPosts / catPostPerPage)
    Array.from({ length: catPages }).forEach((_, i) => {
      createPage({
        path:
          i === 0
            ? `/category/${node.fieldValue}` // 最初のページ
            : `/category/${node.fieldValue}/page/${i + 1}`, // 2ページ目以降
        component: path.resolve(`./src/templates/cat-template.js`), // テンプレート指定
        context: {
          cat_slug: node.fieldValue, // カテゴリースラッグをテンプレートに送る
          skip: catPostPerPage * i,
          limit: catPostPerPage,
        },
      })
    })
  })
```

ここで一旦、ローカルでGatsby.jsを立ち上げて、ブラウザ上で404ページ（存在しないページ）を表示してみましょう。生成されたパスが確認できるはずです。

## カテゴリーテンプレートを編集

カテゴリーページのテンプレートでは、GraphQLから二つの階層を利用します。

- カテゴリー情報である`categoryJson` → カテゴリーのタイトルやディスクリプション
- 全記事`allMarkdownRemark` → そのカテゴリーに属する記事全て

`gatsby-node.js`でのカテゴリーページ生成時に、コンテキストとして`cat_slug`を作りました。その`cat_slug`を使い、表示するカテゴリーや記事一覧の絞り込みをします。

データ取得の例：

<div class="filename">/src/templates/cat-template.js</div>

```js
export const query = graphql`
  query ($cat_slug: String!, $skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      filter: {
        frontmatter: {
          category: { elemMatch: { slug: { eq: $cat_slug } } }
        }
      }
    ) {
      nodes {
        id
        html
        frontmatter {
          title
          slug
        }
      }
    }
    categoryJson(slug: { eq: $cat_slug }) {
      title
      slug
      description
    }
  }
`
```

あとはこれを使って、カテゴリーテンプレート内でタイトルを出力するなりすればOK👌！