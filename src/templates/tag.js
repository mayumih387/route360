import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Author from "../components/author"
import Pagination from "../components/pagination"
import Seo from "../components/seo"
import { homeText, pageIndexText, archiveTitleText } from "../../data/constants"

import * as classes from "../styles/index.module.css"

const TagPage = ({ data, pageContext }) => {
  const currentLang = pageContext.language

  return (
    <Layout
      currentLang={pageContext.language}
      pagePath={`tag/${pageContext.slug}/`}
    >
      <Author currentLang={currentLang} />
      <div className={classes.postsContainer}>
        <h1># {data.tagJson.title}</h1>
        {data.allMarkdownRemark.nodes.map((node) => (
          <article key={node.id}>
            <Link to={`/${pageContext.language}/post/${node.fields.slug}`}>
              <div className={classes.postHeader}>
                <ul className={classes.meta}>
                  <li className={classes.date}>
                    <time dateTime={node.frontmatter.date}>
                      {currentLang === "en" && node.frontmatter.dateEN}
                      {currentLang === "fr" && node.frontmatter.dateFR}
                      {currentLang === "ja" && node.frontmatter.dateJP}
                    </time>
                  </li>
                  {node.frontmatter?.lastmod > node.frontmatter.date && (
                    <li className={classes.date}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                      >
                        <path
                          d="M21 10h-4m4 0V6m0 4-3.3-3.7a8 8 0 1 0 1.7 8.7"
                          stroke="var(--secondary-font-color)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <time dateTime={node.frontmatter.lastmod}>
                        {currentLang === "en" && node.frontmatter.lastmodEN}
                        {currentLang === "fr" && node.frontmatter.lastmodFR}
                        {currentLang === "ja" && node.frontmatter.lastmodJP}
                      </time>
                    </li>
                  )}
                </ul>
                <h2>{node.frontmatter.title}</h2>
              </div>
              <p>{node.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
      {pageContext.pages > 1 && (
        <Pagination pageContext={pageContext} tagSlug={pageContext.slug} />
      )}
    </Layout>
  )
}

export const Head = ({ data, pageContext, location }) => {
  const currentLang = pageContext.language

  const pageIndex = pageIndexText(pageContext.currentPage, pageContext.pages)
  const pageTitle = archiveTitleText(data.tagJson.title)

  const schema = [
    {
      "@type": "CollectionPage",
      "@id": `${data.site.siteMetadata.siteUrl}/${currentLang}/tag/${pageContext.slug}/`,
      url:
        pageContext.currentPage > 1
          ? `${data.site.siteMetadata.siteUrl}/${currentLang}/tag/${pageContext.slug}/page/${pageContext.currentPage}/`
          : `${data.site.siteMetadata.siteUrl}/${currentLang}/tag/${pageContext.slug}/`,
      name:
        pageContext.currentPage > 1
          ? `${pageTitle[currentLang]} - ${pageIndex[currentLang]} | ${data.site.siteMetadata.title}`
          : `${pageTitle[currentLang]} - | ${data.site.siteMetadata.title}`,
      isPartOf: {
        "@id": `${data.site.siteMetadata.siteUrl}/${currentLang}/#website`,
      },
      primaryImageOfPage: {
        "@id":
          pageContext.currentPage > 1
            ? `${data.site.siteMetadata.siteUrl}/${currentLang}/tag/${pageContext.slug}/page/${pageContext.currentPage}/#primaryimage`
            : `${data.site.siteMetadata.siteUrl}/${currentLang}/tag/${pageContext.slug}/#primaryimage`,
      },
      image: {
        "@id":
          pageContext.currentPage > 1
            ? `${data.site.siteMetadata.siteUrl}/${currentLang}/tag/${pageContext.slug}/page/${pageContext.currentPage}/#primaryimage`
            : `${data.site.siteMetadata.siteUrl}/${currentLang}/tag/${pageContext.slug}/#primaryimage`,
      },
      thumbnailUrl: `${data.site.siteMetadata.siteUrl}${data.file.childImageSharp.original.src}`,
      breadcrumb: {
        "@id":
          pageContext.currentPage > 1
            ? `${data.site.siteMetadata.siteUrl}/${currentLang}/tag/${pageContext.slug}/page/${pageContext.currentPage}/#breadcrumb`
            : `${data.site.siteMetadata.siteUrl}/${currentLang}/tag/${pageContext.slug}/#breadcrumb`,
      },
      inLanguage: currentLang,
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        pageContext.currentPage > 1
          ? `${data.site.siteMetadata.siteUrl}/${currentLang}/tag/${pageContext.slug}/page/${pageContext.currentPage}/#breadcrumb`
          : `${data.site.siteMetadata.siteUrl}/${currentLang}/tag/${pageContext.slug}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: homeText[currentLang],
          item: `${data.site.siteMetadata.siteUrl}/${currentLang}/`,
        },
        { "@type": "ListItem", position: 2, name: data.tagJson.title },
      ],
    },
  ]

  return (
    <>
      <html lang={currentLang} />
      <Seo
        currentLang={currentLang}
        pageTitle={
          pageContext.currentPage > 1
            ? `${pageTitle[currentLang]} - ${pageIndex[currentLang]} - ${data.site.siteMetadata.title}`
            : `${pageTitle[currentLang]} - ${data.site.siteMetadata.title}`
        }
        pagePath={location.pathname}
        pageSchema={schema}
      />
    </>
  )
}

export const query = graphql`
  query ($language: String!, $skip: Int!, $limit: Int!, $slug: String!) {
    allMarkdownRemark(
      filter: {
        fields: { language: { eq: $language }, type: { eq: "posts" } }
        frontmatter: { tags: { elemMatch: { slug: { eq: $slug } } } }
      }
      sort: { frontmatter: { date: DESC } }
      skip: $skip
      limit: $limit
    ) {
      nodes {
        id
        frontmatter {
          title
          date
          dateEN: date(formatString: "MMM DD YYYY")
          dateFR: date(formatString: "DD MMM YYYY", locale: "fr")
          dateJP: date(formatString: "YYYY/M/D")
          lastmod
          lastmodEN: lastmod(formatString: "MMM DD YYYY")
          lastmodFR: lastmod(formatString: "DD MMM YYYY", locale: "fr")
          lastmodJP: lastmod(formatString: "YYYY/M/D")
        }
        fields {
          slug
        }
        excerpt(pruneLength: 120, truncate: true)
      }
    }
    tagJson(slug: { eq: $slug }) {
      title
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

export default TagPage
