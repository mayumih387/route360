---
title: Gatsby.js + 多言語サイトの、言語別RSSフィードの作成方法
tags:
  - gatsbyjs
  - internationalization
  - markdown
  - seo
date: 2023-06-01T01:00:00.000Z
lastmod: 2023-06-01T01:00:00.000Z
draft: false
---

当サイト（route360.dev）は、Gatsby.jsで構築されたブログです。コンテンツはMarkdownで管理されています。

需要があるかどうかはわかりませんが、一応RSSフィードも言語別に配信しております。

- 🇯🇵 [日本語フィード](/rss.ja.xml)
- 🇺🇸 [英語フィード](/rss.en.xml)
- 🇫🇷 [仏語フィード](/rss.fr.xml)

これらはGatsby.jsの公式プラグイン`gatsby-plugin-feed`を使って生成しています。ただ、そのままではすべての言語のコンテンツが一緒くたになってしまい、読者にとって不便です。

今回は、Gatsby.jsのRSSフィードを言語別に生成するカスタマイズ方法を紹介します。

尚、[当ブログはGitHubでリポジトリを公開](https://github.com/mayumih387/route360)しています。詳細なコードを知りたい方はご参照ください。

動作環境:

- gatsby v5.10.0
- gatsby-plugin-feed v5.10.0
- react v18.2.0
- node v18.16.0

## 前提条件

当サイトのファイル管理の構造は、以下の通りです。

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

- フォルダー名 = スラッグ
- ファイル名 = 言語コード

として、URLパスに反映。

スラッグと言語コードをmarkdownRemarkの要素としてGraphQLで取得できるようにするため、以下のコードを`gatsby-node.js`に記述しています。

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

これにより、フォルダー名が`slug`、ファイル名が`language`としてmarkdownRemarkに紐付けされ、`markdownRemark`スキーマの`fields`要素から取得できるようになっています。

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

CMSを利用している場合は、デフォルトでクエリから言語やスラッグを取得できる場合もあると思うので、以下で紹介するコードのクエリを適宜カスタマイズしてください。

## コード

早速ですが、コードです。長いですが、やっていることは言語別で同じ事の繰り返しです。

※説明のため、[実際のコード](https://github.com/mayumih387/route360/blob/main/gatsby-config.js)を一部簡略化しています。

<div class="filename">gatsby-config.js</div>

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            query: `
              {
                allMarkdownRemark(
                  filter: {
                    fields: { language: { eq: "en" } }
                  }
                  sort: { frontmatter: { date: DESC } }
                  limit: 10
                ) {
                  nodes {
                    excerpt
                    frontmatter {
                      title
                      date
                    }
                    fields {
                      slug
                    }
                  }
                }
              }
            `,
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.nodes.map(node => {
                return Object.assign({}, node.frontmatter, {
                  description: node.excerpt,
                  date: node.frontmatter.date,
                  url: `${site.siteMetadata.siteUrl}/en/post/${node.fields.slug}/`,
                  guid: `${site.siteMetadata.siteUrl}/en/post/${node.fields.slug}/`,
                })
              })
            },
            output: "/rss.en.xml",
            title: "Route360",
            description: "Blog by a frontend developer",
            site_url: "https://route360.dev/en/",
            feed_url: "https://route360.dev/rss.en.xml",
          },
          {
            query: `
              {
                allMarkdownRemark(
                  filter: {
                    fields: { language: { eq: "fr" } }
                  }
                  sort: { frontmatter: { date: DESC } }
                  limit: 10
                ) {
                  nodes {
                    excerpt
                    frontmatter {
                      title
                      date
                    }
                    fields {
                      slug
                    }
                  }
                }
              }
            `,
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.nodes.map(node => {
                return Object.assign({}, node.frontmatter, {
                  description: node.excerpt,
                  date: node.frontmatter.date,
                  url: `${site.siteMetadata.siteUrl}/fr/post/${node.fields.slug}/`,
                  guid: `${site.siteMetadata.siteUrl}/fr/post/${node.fields.slug}/`,
                })
              })
            },
            output: "/rss.fr.xml",
            title: "Route360",
            description: "Blog par une développeuse front-end",
            site_url: "https://route360.dev/fr/",
            feed_url: "https://route360.dev/rss.fr.xml",
          },
          {
            query: `
              {
                allMarkdownRemark(
                  filter: {
                    fields: { language: { eq: "ja" } }
                  }
                  sort: { frontmatter: { date: DESC } }
                  limit: 10
                ) {
                  nodes {
                    excerpt
                    frontmatter {
                      title
                      date
                    }
                    fields {
                      slug
                    }
                  }
                }
              }
            `,
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.nodes.map(node => {
                return Object.assign({}, node.frontmatter, {
                  description: node.excerpt,
                  date: node.frontmatter.date,
                  url: `${site.siteMetadata.siteUrl}/ja/post/${node.fields.slug}/`,
                  guid: `${site.siteMetadata.siteUrl}/ja/post/${node.fields.slug}/`,
                })
              })
            },
            output: "/rss.ja.xml",
            title: "Route360",
            description: "フロントエンドの開発記録",
            site_url: "https://route360.dev/ja/",
            feed_url: "https://route360.dev/rss.ja.xml",
          },
        ],
      },
    },
  ],
}
```

## RSSフィードの出力例

日本語のRSSフィードの出力例です。

<div class="filename">public/rss.ja.xml</div>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
   <channel>
      <title><![CDATA[Route360]]></title>
      <description><![CDATA[フロントエンドの開発記録]]></description>
      <link>https://route360.dev/ja/</link>
      <generator>GatsbyJS</generator>
      <lastBuildDate>Mon, 22 May 2023 14:35:26 GMT</lastBuildDate>
      <atom:link href="https://route360.dev/rss.ja.xml" rel="self" type="application/rss+xml" />
      <item>
         <title><![CDATA[多言語Gatsby.jsサイトのサイトマップ作成とカスタマイズの手順]]></title>
         <description><![CDATA[当サイトroute360.devは、Gatsby.jsで作られた多言語サイトです。 今回、Gatsby.js公式のサイトマップ生成プラグイン「gatsby-plugin-sitemap」を用いて、多言語サイト用にカスタマイズする方法を説明します。 このブログはリポジトリを公開し…]]></description>
         <link>https://route360.dev/ja/post/gatsby-i18n-sitemap/</link>
         <guid isPermaLink="false">https://route360.dev/ja/post/gatsby-i18n-sitemap/</guid>
         <pubDate>Mon, 22 May 2023 11:17:32 GMT</pubDate>
      </item>
      <item>
      <!-- 中略 -->
      </item>
   </channel>
</rss>
```

## コードの説明

ポイントとしては、ただ1点。「言語毎にクエリを分けてフィードを生成」するだけ。

日本語フィードの生成部分だけを抜き出して説明します。

```js
{
  resolve: `gatsby-plugin-feed`,
  options: {
    query: `
      {
        site {
          siteMetadata {
            title
            siteUrl
          }
        }
      }
    `,
    feeds: [
      {
        // 最新10件、日本語記事のみをフィルタリング
        query: `
          {
            allMarkdownRemark(
              filter: {
                fields: { language: { eq: "ja" } }
              }
              sort: { frontmatter: { date: DESC } }
              limit: 10
            ) {
              nodes {
                excerpt
                frontmatter {
                  title
                  date
                }
                fields {
                  slug
                }
              }
            }
          }
        `,
        // RSSフィードに使うデータを形成し生成
        serialize: ({ query: { site, allMarkdownRemark } }) => {
          return allMarkdownRemark.nodes.map(node => {
            return Object.assign({}, node.frontmatter, {
              description: node.excerpt,
              date: node.frontmatter.date,
              url: `${site.siteMetadata.siteUrl}/ja/post/${node.fields.slug}/`,
              guid: `${site.siteMetadata.siteUrl}/ja/post/${node.fields.slug}/`,
            })
          })
        },
        output: "/rss.ja.xml", // 出力ファイル名
        title: "Route360",
        description: "フロントエンドの開発記録",
        site_url: "https://route360.dev/ja/",
        feed_url: "https://route360.dev/rss.ja.xml",
      },
    ],
  },
},
```

これを各言語別に繰り返すだけです。簡単ですね。
