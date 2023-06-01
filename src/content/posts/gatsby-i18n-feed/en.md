---
title: Creating language-specific RSS feeds for a multilingual Gatsby site
tags:
  - gatsbyjs
  - internationalization
  - markdown
  - seo
date: 2023-06-01T01:00:00.000Z
lastmod: 2023-06-01T01:00:00.000Z
draft: false
---

This website is developed with Gatsby.js (as of June 2023). The content is written in Markdown.

RSS feeds are created for each language.

- 🇺🇸 [English feeds](/rss.en.xml)
- 🇫🇷 [French feeds](/rss.fr.xml)
- 🇯🇵 [Japanese feeds](/rss.ja.xml)

I generate these RSS feeds with `gatsby-plugin-feed`, an official Gatsby plugin. Although this plugin is very useful, you can only generate one RSS for all languages with the official example.

In this entry, I'll show you how to generate RSS feeds for each locale.

Since I'm keeping [the GitHub repository for this blog public](https://github.com/mayumih387/route360), check it out if you're interested.

Environment:

- gatsby v5.10.0
- gatsby-plugin-feed v5.10.0
- react v18.2.0
- node v18.16.0

## Prerequisite

The file structure of this site is as follows;

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

These dirnames/filenames are used for URL paths;

- directory name = slug
- filename = language code

To get these names as elements of markdownRemark in GraphQL, I added the following code to `gatsby-node.js`;

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

You can now get its directory name as `slug` and the filename as `language` from the `fields` schema of `markdownRemark`.

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

If you are using a CMS, you may be able to get the language code and slug from the default query. In these cases, edit the following code accordingly.

## Code

Here is the code. It may look long, but I'm just repeating the same thing for each language.

\*I have simplified [my actual code](https://github.com/mayumih387/route360/blob/main/gatsby-config.js) for the sake of explanation.

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

## RSS Feed Output Example

Here is an example of English RSS feed;

<div class="filename">public/rss.en.xml</div>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
   <channel>
      <title><![CDATA[Route360]]></title>
      <description><![CDATA[ Blog by a frontend developer ]]></description>
      <link>https://route360.dev/en/</link>
      <generator>GatsbyJS</generator>
      <lastBuildDate>Fri, 26 May 2023 03:04:23 GMT</lastBuildDate>
      <atom:link href="https://route360.dev/rss.en.xml" rel="self" type="application/rss+xml" />
      <item>
        <title>
        <![CDATA[ Generating a custom XML sitemap for a multilingual Gatsby site ]]>
        </title>
        <description>
        <![CDATA[ This blog (route360.dev) is a multilingual website generated by Gatsby.js. In this entry, I'll explain how to customize the xml sitemap wit… ]]>
        </description>
        <link>https://route360.dev/en/post/gatsby-i18n-sitemap/</link>
        <guid isPermaLink="false">https://route360.dev/en/post/gatsby-i18n-sitemap/</guid>
        <pubDate>Fri, 26 May 2023 01:00:00 GMT</pubDate>
      </item>
      <item>
      <!-- snip -->
      </item>
   </channel>
</rss>
```

## Explanation

The only thing you need to do is prepare the query for each language.

The code below is the English part;

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
        // Filtering the latest 10 posts, English only
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
        // Edit and generate data for RSS feeds
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
        output: "/rss.en.xml", // Output filename
        title: "Route360",
        description: "Blog by a frontend developer",
        site_url: "https://route360.dev/en/",
        feed_url: "https://route360.dev/rss.en.xml",
      },
    ],
  },
},
```

Just repeat this for each language/locale. That's it!
