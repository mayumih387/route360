---
title: Créer des flux RSS spécifiques à la langue pour un site Gatsby multilingue
tags:
  - gatsbyjs
  - internationalization
  - markdown
  - seo
date: 2023-06-01T01:00:00.000Z
lastmod: 2023-06-01T01:00:00.000Z
draft: false
---

Ce site web est développé avec Gatsby.js (à partir de juin 2023). Le contenu est écrit en Markdown.

Des flux RSS sont créés pour chaque langue.

- 🇫🇷 [Flux français](/rss.fr.xml)
- 🇺🇸 [Flux anglais](/rss.en.xml)
- 🇯🇵 [Flux japonais](/rss.ja.xml)

Je génère ces flux RSS avec `gatsby-plugin-feed`, un plugin officiel de Gatsby. Bien que ce plugin soit très utile, vous ne pouvez générer qu'un seul flux RSS pour toutes les langues avec l'exemple officiel.

Dans cet article, je vous montrerai comment générer des flux RSS pour chaque langue.

Comme je garde [le dépôt GitHub de ce blog public](https://github.com/mayumih387/route360), jetez-y un coup d'œil si cela vous intéresse.

Environment:

- gatsby v5.10.0
- gatsby-plugin-feed v5.10.0
- react v18.2.0
- node v18.16.0

## Prérequis

La structure des fichiers de ce site est la suivante ;

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

Ces noms de répertoires/fichiers sont utilisés pour les chemins d'accès aux URL ;

- directory name = slug
- filename = language code

Pour obtenir ces noms comme éléments de markdownRemark dans GraphQL, j'ai ajouté le code suivant à `gatsby-node.js` ;

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

Vous pouvez maintenant obtenir son nom de répertoire comme `slug` et le nom de fichier comme `language` à partir du schéma `fields` de `markdownRemark`.

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

Si vous utilisez un CMS, vous pouvez peut-être obtenir le code de la langue et le slug à partir de la requête par défaut. Dans ce cas, modifiez le code suivant en conséquence.

## Code

Voici le code. Il peut paraître long, mais je ne fais que répéter la même chose pour chaque langue.

\*J'ai simplifié [mon code réel](https://github.com/mayumih387/route360/blob/main/gatsby-config.js) pour les besoins de l'explication.

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

## Exemple de sortie de flux RSS

Voici un exemple de flux RSS en français ;

<div class="filename">public/rss.en.xml</div>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
   <channel>
      <title><![CDATA[Route360]]></title>
      <description>
        <![CDATA[ Blog par une développeuse front-end ]]>
      </description>
      <link>https://route360.dev/fr/</link>
      <generator>GatsbyJS</generator>
      <lastBuildDate>Fri, 26 May 2023 03:04:23 GMT</lastBuildDate>
      <atom:link href="https://route360.dev/rss.fr.xml" rel="self" type="application/rss+xml"/>
      <item>
        <title>
        <![CDATA[ Générer un plan de site XML pour un site Gatsby multilingue ]]>
        </title>
        <description>
        <![CDATA[ Ce blog (route360.dev) est un site web multilingue généré par Gatsby.js. Dans cet article, je vais expliquer comment personnaliser le sitem… ]]>
        </description>
        <link>https://route360.dev/fr/post/gatsby-i18n-sitemap/</link>
        <guid isPermaLink="false">https://route360.dev/fr/post/gatsby-i18n-sitemap/</guid>
        <pubDate>Fri, 26 May 2023 01:00:00 GMT</pubDate>
      </item>
      <item>
      <!-- snip -->
      </item>
   </channel>
</rss>
```

## Explication

La seule chose à faire est de préparer la requête pour chaque langue.

Le code ci-dessous est la partie française ;

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
        // Filtrer les 10 derniers messages, uniquement en français
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
        // Modifier et générer des données pour les flux RSS
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
        output: "/rss.fr.xml", // Nom du fichier de sortie
        title: "Route360",
        description: "Blog par une développeuse front-end",
        site_url: "https://route360.dev/fr/",
        feed_url: "https://route360.dev/rss.fr.xml",
      },
    ],
  },
},
```

Répétez cette opération pour chaque langue/locale. Voilà, c'est fait !
