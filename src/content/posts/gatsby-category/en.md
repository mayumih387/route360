---
title: How to add categories on Gatsby.js + Markdown blog
tags:
  - jamstack
  - markdown
  - gatsbyjs
date: 2023-01-07T15:00:00.000Z
lastmod: 2023-01-07T15:00:00.000Z
draft: false
---

Though it'd be much easier if you are using a Headless CMS, it's a bit complicated to manage categories or tags in a Markdown blog.

Plus, if the blog language is not in English, you might want to set a category title or a description in your language but its slug in English for SEO. That makes the thing more complicated.

I'd like to propose an idea here about the management of categories in a Gatsby.js Markdown blog. It can be also compatible for tags.

Working environment:

- Node.js v18.12.1
- React v18.2.0
- Gatsby.js v5.6.0
- gatsby-transformer-json v5.6.0

## Prepare a json file for categories

In this case, let us manage the categories in a json file. Make the `category.json` under `/src/data/` directory.

*.js file is also okay. In that case, gatsby-transformer-json is not needed.

<div class="filename">/src/data/category.json</div>

```js
[
  {
    "title": "Comedy",
    "slug": "comedy",
    "description": "Posts about comedy movies. One of my favorite is Paddington!"
  },
  {
    "title": "Horror",
    "slug": "horror",
    "description": "Posts about horror movies. I don't like horror though."
  },
  {
    "title": "Fantasy",
    "slug": "fantasy",
    "description": "Posts about fantasy movies. Harry Potter is the all time best."
  }
]
```

Here is an example of categories. Of course, you can add other properties if you need.

In the case of tags, you can create `tag.json` under the same directory like this.

## Category data in Markdown files

Inside the Markdown files, metadata such as the title or the categories should be managed with YAML Frontmatter. To add categories, use the slugs you've created in `category.json`.

<div class="filename">/content/posts/funny-10-movies.md</div>

```md
---
title: Best 10 funny movies this year!
slug: funniest-10-movies
category:
  - comedy
date: 2022-10-11
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
```

In the example above, I added "comedy" as its category. It can be 2 or more.

## Install gatsby-transformer-json

Next, to fetch the category data with GraphQL, install [gatsby-transformer-json](https://www.gatsbyjs.com/plugins/gatsby-transformer-json/), an official plugin from Gatsby.js.

```bash
# for npm
npm install gatsby-transformer-json

# for yarn
yarn add gatsby-transformer-json
```

At the same time, edit `gatsby-config.js` to add gatsby-transformer-json and json files directory (`/src/data/`) with `gatsby-source-filesystem`.

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

This makes possible to get `CategoryJson` as a new schema.

## Link the category slug between Frontmatter and CategoryJson

The category (or categories) inside the Frontmatter and those in `CategoryJson` are not related yet. But it's possible as they share the same letters as `slug` of `CategoryJson`.

To link `slug` of `CategoryJson` to Frontmatter category, add the following code to `gatsby-node.js`.

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

This makes possible to get category title or description from the `markdownRemark` node.

`createSchemaCustomization` itself is an API to make relationships between two different nodes.

<span class="label warning">Reference</span> [Create foreign key relationships between data - Creating a Source Plugin | Gatsby](https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/creating-a-source-plugin/#create-foreign-key-relationships-between-data)

The GraphQL can now query `markdownRemark` like the following;

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

## Generate category page paths

Now we're making category page paths (URL) with `gatsby-node.js`.

The key is not using `categoryJson` to get category query.

Why? Because we never know that all the categories inside `category.json` are really used in the Markdown files. We have to avoid generating paths for the categories never used.

Therefore, we're using a Group value of `allMarkdownRemark` to pick the categories up from the Markdown files. This is a great Gatsby.js feature I believe.😺

<span class="label warning">Reference</span> [Group - GraphQL Query Options | Gatsby](https://www.gatsbyjs.com/docs/graphql-reference/#group)

Because this Group value filters the only existing category slugs, there is no worry about the paths for non-used categories to be generated.

In the context of this, add a query first;

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
        ...other nodes...
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`)
    return
  }

  // to be continued to next code
}
```

Then next, generate category page paths with `createPage`.

At this point, pass the category slug as a context to template so that it can be used for filtering and pointing the category to show.

<div class="filename">/gatsby-node.js</div>

```js
  // being continued

  const catPostPerPage = 10 // the number of posts par page
  blogresult.data.allMarkdownRemark.group.forEach((node) => {
    const catPosts = node.totalCount
    const catPages = Math.ceil(catPosts / catPostPerPage)
    Array.from({ length: catPages }).forEach((_, i) => {
      createPage({
        path:
          i === 0
            ? `/category/${node.fieldValue}` // first page
            : `/category/${node.fieldValue}/page/${i + 1}`, // 2nd or next pages
        component: path.resolve(`./src/templates/cat-template.js`), // template to use
        context: {
          cat_slug: node.fieldValue, // send category slug to template
          skip: catPostPerPage * i,
          limit: catPostPerPage,
        },
      })
    })
  })
```

So, `gatsby-node.js` is now done. For a moment, open 404 page on a browser and look at the pages been generated. You'll see the category page paths.

## Edit the category template

Inside the category template, we use two types of node from GraphQL.

- `categoryJson` as category data -> category title or category description
- `allMarkdownRemark` as posts in that category

We've made `cat_slug` as a context when generating category pages in `gatsby-node.js`. With the `cat_slug`, inside the template, the category or the posts to display can be filtered.

Example to get nodes:

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

That's it! Now, just show the category title or anything inside the template👌