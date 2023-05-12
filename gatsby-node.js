/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const blogresult = await graphql(`
    query {
      allPostsEN: allMarkdownRemark(
        filter: {
          frontmatter: { draft: { ne: true } }
          fields: { language: { eq: "en" }, type: { eq: "posts" } }
        }
        sort: { frontmatter: { date: DESC } }
      ) {
        totalCount
        edges {
          node {
            id
            fields {
              slug
            }
          }
          next {
            frontmatter {
              title
            }
            fields {
              slug
            }
          }
          previous {
            frontmatter {
              title
            }
            fields {
              slug
            }
          }
        }
        group(field: { frontmatter: { tags: { slug: SELECT } } }) {
          fieldValue
          totalCount
        }
      }
      allPostsFR: allMarkdownRemark(
        filter: {
          frontmatter: { draft: { ne: true } }
          fields: { language: { eq: "fr" }, type: { eq: "posts" } }
        }
        sort: { frontmatter: { date: DESC } }
      ) {
        totalCount
        edges {
          node {
            id
            fields {
              slug
            }
          }
          next {
            frontmatter {
              title
            }
            fields {
              slug
            }
          }
          previous {
            frontmatter {
              title
            }
            fields {
              slug
            }
          }
        }
        group(field: { frontmatter: { tags: { slug: SELECT } } }) {
          fieldValue
          totalCount
        }
      }
      allPostsJA: allMarkdownRemark(
        filter: {
          frontmatter: { draft: { ne: true } }
          fields: { language: { eq: "ja" }, type: { eq: "posts" } }
        }
        sort: { frontmatter: { date: DESC } }
      ) {
        totalCount
        edges {
          node {
            id
            fields {
              slug
            }
          }
          next {
            frontmatter {
              title
            }
            fields {
              slug
            }
          }
          previous {
            frontmatter {
              title
            }
            fields {
              slug
            }
          }
        }
        group(field: { frontmatter: { tags: { slug: SELECT } } }) {
          fieldValue
          totalCount
        }
      }
      allPagesEN: allMarkdownRemark(
        filter: { fields: { language: { eq: "en" }, type: { eq: "pages" } } }
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
      allPagesFR: allMarkdownRemark(
        filter: { fields: { language: { eq: "fr" }, type: { eq: "pages" } } }
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
      allPagesJA: allMarkdownRemark(
        filter: { fields: { language: { eq: "ja" }, type: { eq: "pages" } } }
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
    reporter.panicOnBuild(`GraphQLのクエリでエラーが発生しました`)
    return
  }

  const postsPerPage = 5

  // Single Post Pages
  const allPosts = {
    en: blogresult.data.allPostsEN,
    fr: blogresult.data.allPostsFR,
    ja: blogresult.data.allPostsJA,
  }

  Object.keys(allPosts).forEach(key => {
    allPosts[key].edges.forEach(({ node, next, previous }) => {
      createPage({
        path: `/${key}/post/${node.fields.slug}/`,
        component: require.resolve(`./src/templates/post.js`),
        context: {
          id: node.id,
          slug: node.fields.slug,
          language: key,
          next,
          previous,
        },
      })
    })
  })

  // Independent Pages
  const allPages = {
    en: blogresult.data.allPagesEN.edges,
    fr: blogresult.data.allPagesFR.edges,
    ja: blogresult.data.allPagesJA.edges,
  }

  Object.keys(allPages).forEach(key => {
    allPages[key].forEach(({ node }) => {
      createPage({
        path: `/${key}/${node.fields.slug}/`,
        component: require.resolve(`./src/templates/page.js`),
        context: {
          id: node.id,
          slug: node.fields.slug,
          language: key,
        },
      })
    })
  })

  // Tag Pages
  const allPostsGroup = {
    en: blogresult.data.allPostsEN.group,
    fr: blogresult.data.allPostsFR.group,
    ja: blogresult.data.allPostsJA.group,
  }

  const tagPages = []

  Object.keys(allPostsGroup).forEach(key => {
    allPostsGroup[key].forEach(node => {
      const tagPage = {
        language: key,
        slug: node.fieldValue,
        totalPages: Math.ceil(node.totalCount / postsPerPage),
      }
      tagPages.push(tagPage)
    })
  })

  tagPages.forEach(({ language, slug, totalPages }) => {
    for (let i = 0; i < totalPages; i++) {
      createPage({
        path:
          i === 0
            ? `/${language}/tag/${slug}/`
            : `/${language}/tag/${slug}/page/${i + 1}/`,
        component: require.resolve(`./src/templates/tag.js`),
        context: {
          slug,
          skip: postsPerPage * i,
          limit: postsPerPage,
          currentPage: i + 1, //current page number
          isFirst: i + 1 === 1, //if it's the first page
          isLast: i + 1 === totalPages, //if it's the last page
          pages: totalPages,
          language,
        },
      })
    }
  })

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

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
  type MarkdownRemark implements Node {
    frontmatter: Frontmatter
  }
  type Frontmatter implements Node {
    tags: [TagJson] @link(by: "slug")
  }
  `
  createTypes(typeDefs)
}

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

    createNodeField({
      node,
      name: "type",
      value: fileNode.relativeDirectory.match(/^([^\/]+)\//)[1],
    })
  }
}
