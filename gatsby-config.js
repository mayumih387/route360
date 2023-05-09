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
        path: `${__dirname}/src/data`,
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
            },
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 820,
              wrapperStyle: (fluidResult) =>
                `max-height: 615px; aspect-ratio: ${fluidResult.aspectRatio}`,
              srcSetBreakpoints: [414, 768],
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
          `gatsby-remark-gifs`,
        ],
      },
    },
    `gatsby-plugin-catch-links`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Route360`,
        short_name: `Route360`,
        start_url: `/`,
        background_color: `#663399`,
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
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.nodes.map((node) => {
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
              return allMarkdownRemark.nodes.map((node) => {
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
              return allMarkdownRemark.nodes.map((node) => {
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
  ],
}
