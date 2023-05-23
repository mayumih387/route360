/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Route360`,
    description: `Blog by a frontend developer`,
    author: `mayumihara`,
    siteUrl: `https://route360.dev/`,
  },
  trailingSlash: `always`,
  plugins: [
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/src/content`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/data`,
      },
    },
    `gatsby-transformer-json`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              showLineNumbers: false,
              languageExtensions: [
                {
                  language: "tree",
                  extend: "json",
                  definition: {
                    "entry-line": [
                      {
                        pattern: /\|-- |├─ /,
                        alias: "line-h",
                      },
                      {
                        pattern: /\||│/,
                        alias: "line-v",
                      },
                      {
                        pattern: /`-- |└─ /,
                        alias: "line-v-last",
                      },
                      {
                        pattern: / {4}/,
                        alias: "line-v-gap",
                      },
                    ],
                    "entry-dir": {
                      pattern: /.*[\/](?!\w).*/,
                      inside: {
                        // symlink
                        operator: / -> /,
                      },
                    },
                    "entry-symlink": {
                      pattern: /.*\S.* (-> .*)/,
                      inside: {
                        operator: / -> /,
                        file: /(.*)/,
                      },
                    },
                    "entry-name": {
                      pattern: /.*\S.*/,
                      inside: {
                        // symlink
                        operator: / -> /,
                      },
                    },
                  },
                },
              ],
            },
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 820,
              srcSetBreakpoints: [400, 610],
              showCaptions: ["title"],
              markdownCaptions: true,
              linkImagesToOriginal: false,
            },
          },
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              offsetY: `24`,
              icon: false,
            },
          },
          {
            resolve: `gatsby-remark-copy-linked-files`,
            options: {
              ignoreFileExtensions: [`png`, `jpg`, `jpeg`, `bmp`, `tiff`],
            },
          },
        ],
      },
    },
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-twitter`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Route360`,
        short_name: `Route360`,
        start_url: `/en/`,
        background_color: `#1c1c1e`,
        display: `minimal-ui`,
        icon: `src/images/favicon.png`,
      },
    },
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
                    frontmatter: { draft: { ne: true } }
                    fields: { language: { eq: "en" }, type: { eq: "posts" } }
                  }
                  sort: { frontmatter: { date: DESC } }
                  limit: 10
                ) {
                  nodes {
                    excerpt(format: PLAIN, truncate: true)
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
            site_url: "https://route360.dev",
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
                    fields: { language: { eq: "fr" }, type: { eq: "posts" } }
                  }
                  sort: { frontmatter: { date: DESC } }
                  limit: 10
                ) {
                  nodes {
                    excerpt(format: PLAIN, truncate: true)
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
            site_url: "https://route360.dev",
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
                    fields: { language: { eq: "ja" }, type: { eq: "posts" } }
                  }
                  sort: { frontmatter: { date: DESC } }
                  limit: 10
                ) {
                  nodes {
                    excerpt(format: PLAIN, truncate: true)
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
            site_url: "https://route360.dev",
            feed_url: "https://route360.dev/rss.ja.xml",
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        query: `
        {
          site {
            siteMetadata {
              siteUrl
            }
          }
          allSitePage {
            nodes {
              path
            }
          }
          allMarkdownRemarkEN: allMarkdownRemark(
            filter: {
              frontmatter: { draft: { ne: true } }
              fields: { language: { eq: "en" }, type: { eq: "posts" } }
            }
          ) {
            nodes {
              fields {
                slug
                language
                type
              }
              frontmatter {
                lastmod
              }
            }
          }
          allMarkdownRemarkFR: allMarkdownRemark(
            filter: {
              frontmatter: { draft: { ne: true } }
              fields: { language: { eq: "fr" }, type: { eq: "posts" } }
            }
          ) {
            nodes {
              fields {
                slug
                language
                type
              }
              frontmatter {
                lastmod
              }
            }
          }
          allMarkdownRemarkJA: allMarkdownRemark(
            filter: {
              frontmatter: { draft: { ne: true } }
              fields: { language: { eq: "ja" }, type: { eq: "posts" } }
            }
          ) {
            nodes {
              fields {
                slug
                language
                type
              }
              frontmatter {
                lastmod
              }
            }
          }
        }`,
        resolvePages: ({
          allSitePage: { nodes: allPages },
          allMarkdownRemarkEN,
          allMarkdownRemarkFR,
          allMarkdownRemarkJA,
        }) => {
          const pathToDateMap = {}

          const allMarkdownRemark = [
            ...allMarkdownRemarkEN.nodes,
            ...allMarkdownRemarkFR.nodes,
            ...allMarkdownRemarkJA.nodes,
          ]

          allMarkdownRemark.forEach(post => {
            const { slug, language, type } = post.fields
            pathToDateMap[
              type === "posts"
                ? `/${language}/post/${slug}/`
                : `/${language}/${slug}/`
            ] = {
              lastmod: post.frontmatter.lastmod,
            }
          })

          const pages = allPages.map(page => {
            const alternateLangs = allPages
              .filter(
                alterPage =>
                  alterPage.path.replace(/\/.*?\//, "/") ===
                  page.path.replace(/\/.*?\//, "/")
              )
              .map(alterPage => alterPage.path.match(/^\/([a-z]{2})\//))
              .filter(match => match)
              .map(match => match[1])

            return {
              ...page,
              ...pathToDateMap[page.path],
              ...{ alternateLangs },
            }
          })

          return pages
        },
        serialize: ({ path, lastmod, alternateLangs }) => {
          const pagepath = path.replace(/\/.*?\//, "/")

          const xhtmlLinks =
            alternateLangs.length > 1 &&
            alternateLangs.map(lang => ({
              rel: "alternate",
              hreflang: lang,
              url: `/${lang}${pagepath}`,
            }))

          let entry = {
            url: path,
            changefreq: "daily",
            priority: lastmod ? 0.7 : 0.5,
          }

          if (lastmod) {
            entry.lastmod = lastmod
          }
          if (xhtmlLinks) {
            entry.links = xhtmlLinks
          }

          return entry
        },
      },
    },
  ],
}
