import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import PostBody from "../components/post-body"
import Seo from "../components/seo"
import { homeText } from "../../data/constants"

const PagePost = ({ data, pageContext }) => {
  const availLangs = data.allMarkdownRemark.nodes.map(
    (node) => node.fields.language
  )

  const currentLang = pageContext.language

  return (
    <Layout
      currentLang={currentLang}
      availLangs={availLangs}
      pagePath={`${pageContext.slug}`}
    >
      <PostBody markdownRemark={data.markdownRemark} />
    </Layout>
  )
}

export const Head = ({ data, pageContext, location }) => {
  const availLangs = data.allMarkdownRemark.nodes.map(
    (node) => node.fields.language
  )

  const currentLang = pageContext.language

  const schema = [
    {
      "@type": "WebPage",
      "@id": `${data.site.siteMetadata.siteUrl}${location.pathname}`,
      url: `${data.site.siteMetadata.siteUrl}${location.pathname}`,
      name: `${data.markdownRemark.frontmatter.title} - ${data.site.siteMetadata.title}`,
      isPartOf: {
        "@id": `${data.site.siteMetadata.siteUrl}/${currentLang}/#website`,
      },
      primaryImageOfPage: {
        "@id": `${data.site.siteMetadata.siteUrl}${location.pathname}#primaryimage`,
      },
      image: {
        "@id": `${data.site.siteMetadata.siteUrl}${location.pathname}#primaryimage`,
      },
      thumbnailUrl: `${data.site.siteMetadata.siteUrl}${data.file.childImageSharp.original.src}`,
      datePublished: data.markdownRemark.frontmatter.date,
      dateModified: data.markdownRemark.frontmatter.lastmod,
      breadcrumb: {
        "@id": `${data.site.siteMetadata.siteUrl}${location.pathname}#breadcrumb`,
      },
      inLanguage: currentLang,
      potentialAction: [
        {
          "@type": "ReadAction",
          target: [`${data.site.siteMetadata.siteUrl}${location.pathname}`],
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${data.site.siteMetadata.siteUrl}${location.pathname}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: homeText[currentLang],
          item: `${data.site.siteMetadata.siteUrl}/${currentLang}/#breadcrumb`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: data.markdownRemark.frontmatter.title,
        },
      ],
    },
  ]

  return (
    <>
      <html lang={currentLang} />
      <Seo
        currentLang={currentLang}
        pageTitle={`${data.markdownRemark.frontmatter.title} - ${data.site.siteMetadata.title}`}
        pageDesc={data.markdownRemark.excerpt}
        pagePath={location.pathname}
        pageType="article"
        pageSchema={schema}
        availLangs={availLangs}
      />
    </>
  )
}

export const query = graphql`
  query ($id: String!, $slug: String!) {
    markdownRemark(id: { eq: $id }) {
      frontmatter {
        title
      }
      html
      excerpt(pruneLength: 140, truncate: true)
      wordCount {
        words
      }
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
    site {
      siteMetadata {
        title
        siteUrl
        author
      }
    }
    file(name: { eq: "favicon" }) {
      childImageSharp {
        original {
          src
          width
          height
        }
      }
    }
  }
`

export default PagePost
