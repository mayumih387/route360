---
title: How to Create a Multilingual Blog with Gatsby.js + Markdown
tags:
  - gatsbyjs
  - internationalization
  - markdown
date: 2023-05-18T01:00:00.000Z
lastmod: 2023-05-18T01:00:00.000Z
draft: false
---

This website is a 3 languages blog made with Gatsby.js. It's realized **without any i18n plugins or modules**, but only with the routing by gatsby-node.js. \*It was running with Next.js until April 2023.

Gatsby.js does not have a built-in feature to get the default language or the current display language, like Next.js's `useRouter()`. There is also no distinction between "default language" and "other languages" in the settings.

This article will show you how I internationalized (i18n) this site, the steps involved and the key points. There are probably other ways for the internationalization, but please read this as one example.

The code for this blog is published on [GitHub repository](https://github.com/mayumih387/route360).

## Key Points for Creating a Multilingual Site with Gatsby.js

1. generate pages by language with `gatsby-node.js`
2. pass the current language to `pageContext` in the first step
3. In each template, get the current language from `pageContext` and pass it to components such as Header and Footer to display differently for each language.

In this way, you can create a multilingual site with Gatsby.js without the need for i18n plug-ins.

## Structure of Markdown files

Markdown files are arranged as follows;

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

I use the folder name as a slug and name the files `[lang].md` for each language. By doing this, I avoid the hassle of adding the slug and language code to the frontmatter metadata and each filename.

Therefore, in `gatsby-node.js`, I add the `slug` and `language` schema with the following code so that the GraphQL query in each post (MarkdownRemark) can retrieve the filename (as slug) and language.

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

Link - [onCreateNode | Gatsby.js](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#onCreateNode)

The above code will allow you to get the slug and language name of each post from a GraphQL query. Of course, it can also be used for filtering and sorting.

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

## How to create paths and generate pages by language

Next, we will use `gatsby-node.js` to create the paths for the pages we want to create.

It is cumbersome, but the query should be generated by language.

- Template name for individual article: post.js
- Template name for top page (all articles): index.js

By generating queries by language, we can get the following benefits:

- Easier paging when the number of posts in each language is different
- Previous and next posts can be retrieved by language

### Generating individual article pages

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

I will not explain paging here, but the possibility that the number of total posts may vary by language should also be taken into account.

If a listing page contains a fifth page in Japanese but only four pages in English, taking queries by language will avoid creating a wasteful page.

### Generating the article list page

Next, add the code to create an articles list page, as shown on the [top page of this blog](/en/).

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

For reference, this blog, which includes a paging feature, does the following ([the repository](https://github.com/mayumih387/route360/blob/main/gatsby-node.js));

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

## How to determine the current display language and translated articles

This section describes creation on individual post article pages. The same concept (obtaining the display language) can be used to generate articles list pages.

### Getting the display language

In the page generation of `gatsby-node.js` mentioned earlier, I added `language` to the `context` property to send the language code as a value.

These will be available in the template as `pageContext` to retrieve the data.

<div class="filename">src/template/post.js</div>

```js
const SinglePost = ( { pageContext } ) => {
  const currentLang = pageContext.language

  return (
    //...
  )
}
```

This value can be sent to each component and used to toggle the display by language in the header and footer.

### Checking for Translated Articles

You can check if there are translations of the article currently displayed, also in the template.

The `gatsby-node.js` page generation includes the slug of the generated page in the `context` property, so the matching post with the slug can be retrieved from `allMarkdownRemark`.

The retrieved query is expanded in jsx by `map()` and stored as an array in the constant name `availLangs`.

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
      ... // Current post data
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

This way, the `availLangs` are sent to the language switcher component and the link is displayed in the switcher only if a translation is available.

\*I will not go into the creation of the language switcher here.

### Adding lang attribute to html tags in Gatsby Head API

Gatsby.js allows you to send dynamic data to `<html>` and `<body>` tags by using `Gatsby Head API` in each template.

As with the JSX description of the template, the current language is retrieved from the `pageContext` and the language attribute of the `<html>` tag can be specified.

<div class="filename">src/template/post.js</div>

```js
export const Head = ({ pageContext }) => {
  const currentLang = pageContext.language

  return <html lang={currentLang} />
}
```

Link - [Gatsby Head API](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/)

### For the articles list page

In the case of articles list pages, such as the top page and tag pages, the current display language is passed to the `context` property in `gatsby-node.js`, so they can be created in the same way using the above approach.

## Creating the top page and the 404 page in different languages　

### Redirection process to the top page

The top page for each language was created in `gatsby-node.js` earlier for each language, but the root domain URL needs to be handled.

When I was creating it with Next.js, `https://route360.dev/` was the English top page. Therefore now, if this URL was accessed, it would redirect to `https://route360.dev/en/`.

The hosting is [Cloudflare Pages](https://www.cloudflare.com/ja-jp/products/pages/). The redirection setting is as follows. \*The same configuration should work for [Netlify](https://www.netlify.com/).

<div class="filename">src/static/_redirects</div>

```text
/ /en 301
```

### Displaying the 404 page

Since Cloudflare Pages does not support custom redirects (Netlify does), I made the 404 page like this; (the actual code below is modified for illustrative purposes)

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

If the path to the 404 page includes a language code such as `/en/`, I display "Return to Home" in that language. If it doesn't, it's in English.

\*With the above evaluation, if the second and third characters are `en` like `length`, it will be evaluated as `English`. If you want to evaluate the path more strictly, please rewrite the code accordingly.

## Implementing language-specific meta tags in headers (for SEO)

For SEO purposes, if there are translated pages, add code in the `<head>` tag regarding availability of translations and default language pages.

In this site, we send `availLangs` data in the SEO component through the Gatsby Head API and add the following data only if there is a translation/translations.

### Notifying Google about the localized version of the page

```html
<link rel="alternate" hreflang="language_code" href="current_url" />
```

Everything is explained in Google's [Methods for indicating your alternate pages](https://developers.google.com/search/docs/specialty/international/localized-versions?hl=en#html) guide.

### Metadata for OGP (Open Graph Protocol)

```html
<meta property="og:locale:alternate" content="language_code" />
```

Also, add metadata for OGP.

## Creating RSS feeds by language

Use [gatsby-plugin-feed](https://www.gatsbyjs.com/plugins/gatsby-plugin-feed/) to generate RSS feeds for each language.

\*The following code is somewhat simplified for explanation.

<div class="filename">gatsby-config.js</div>

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
        output: "/rss.en.xml",
        title: "Route360",
        description: "Blog by a frontend developer",
        site_url: "https://route360.dev/en/",
        feed_url: "https://route360.dev/rss.en.xml",
      },
      {
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
        query: `
          {
            allMarkdownRemark(
              filter: {
                frontmatter: { draft: { ne: true } }
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
        output: "/rss.fr.xml",
        title: "Route360",
        description: "Blog par une développeuse front-end",
        site_url: "https://route360.dev/fr/",
        feed_url: "https://route360.dev/rss.fr.xml",
      },
      {
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
        query: `
          {
            allMarkdownRemark(
              filter: {
                frontmatter: { draft: { ne: true } }
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
        output: "/rss.ja.xml",
        title: "Route360",
        description: "フロントエンドの開発記録",
        site_url: "https://route360.dev/ja",
        feed_url: "https://route360.dev/rss.ja.xml",
      },
    ],
  },
},
```

## Summary

With good use of `gatsby-node.js` path creation, I was able to create a multilingual site with Gatsby.js, without using any special plug-ins for i18n.

When I created a multilingual site with Astro, the official Astro multilingual documentation helped me a lot to understand the structure. The concept worked and was applied again.

It seems that right-to-left languages (e.g., Arabic) would also be okay if the layout component is separated by language.

The next task to do is to internationalize the sitemap, as I mentioned in [Switching an i18n blog to Gatsby.js - Reasons and design overview](/en/post/i18n-next-to-gatsby/).

That's it.