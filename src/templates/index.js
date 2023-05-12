import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Author from "../components/author"
import Pagination from "../components/pagination"
import Seo from "../components/seo"
import { siteDesc, homeText, pageIndexText } from "../../data/i18n"

import * as classes from "../styles/index.module.css"

const IndexPage = ({ data, pageContext }) => {
  const currentLang = pageContext.language

  return (
    <Layout currentLang={currentLang}>
      <Author currentLang={currentLang} />
      <div className={classes.postsContainer}>
        {data.allMarkdownRemark.nodes.map(node => (
          <article key={node.id}>
            <Link to={`/${currentLang}/post/${node.fields.slug}`}>
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
      {pageContext.pages > 1 && <Pagination pageContext={pageContext} />}
    </Layout>
  )
}

export const Head = ({ data, pageContext, location }) => {
  const currentLang = pageContext.language

  const pageIndex = pageIndexText(pageContext.currentPage, pageContext.pages)

  const schema = [
    {
      "@type": "CollectionPage",
      "@id": `${data.site.siteMetadata.siteUrl}/${currentLang}/`,
      url:
        pageContext.currentPage > 1
          ? `${data.site.siteMetadata.siteUrl}/${currentLang}/page/${pageContext.currentPage}/`
          : `${data.site.siteMetadata.siteUrl}/${currentLang}/`,
      name:
        pageContext.currentPage > 1
          ? `${data.site.siteMetadata.title} - ${pageIndex[currentLang]} - ${siteDesc[currentLang]}`
          : `${data.site.siteMetadata.title} - ${siteDesc[currentLang]}`,
      isPartOf: {
        "@id": `${data.site.siteMetadata.siteUrl}/${currentLang}/#website`,
      },
      about: {
        "@id": `${data.site.siteMetadata.siteUrl}/${currentLang}/#/schema/person`,
      },
      description: siteDesc[currentLang],
      breadcrumb: {
        "@id":
          pageContext.currentPage > 1
            ? `${data.site.siteMetadata.siteUrl}/${currentLang}/page/${pageContext.currentPage}/#breadcrumb`
            : `${data.site.siteMetadata.siteUrl}/${currentLang}/#breadcrumb`,
      },
      inLanguage: currentLang,
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        pageContext.currentPage > 1
          ? `${data.site.siteMetadata.siteUrl}/${currentLang}/page/${pageContext.currentPage}/#breadcrumb`
          : `${data.site.siteMetadata.siteUrl}/${currentLang}/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: homeText[currentLang] },
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
            ? `${data.site.siteMetadata.title} - ${pageIndex[currentLang]} - ${siteDesc[currentLang]}`
            : `${data.site.siteMetadata.title} - ${siteDesc[currentLang]}`
        }
        pagePath={location.pathname}
        pageSchema={schema}
      />
    </>
  )
}

export const query = graphql`
  query ($language: String!, $skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      filter: {
        frontmatter: { draft: { ne: true } }
        fields: { language: { eq: $language }, type: { eq: "posts" } }
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
    site {
      siteMetadata {
        title
        siteUrl
        author
      }
    }
    fileLogo: file(name: { eq: "favicon" }) {
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

export default IndexPage
