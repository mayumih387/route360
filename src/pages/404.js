import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import { backToHome, languageMap } from "../../data/i18n"

import * as classes from "../styles/index.module.css"

const NotFoundPage = ({ location }) => {
  const browserLang = location.pathname.slice(1, 3)
  let currentLang = languageMap[browserLang] || languageMap["en"]

  return (
    <Layout currentLang={currentLang}>
      <div className={classes.postsContainer} style={{ textAlign: "center" }}>
        <p>404 Not Found</p>
        <Link
          to={`/${currentLang}/`}
          style={{
            color: "var(--primary-success)",
            textDecoration: "underline",
          }}
        >
          {backToHome[currentLang]}
        </Link>
      </div>
    </Layout>
  )
}

export const Head = ({ data, pageContext }) => {
  return (
    <>
      <html lang={pageContext.language} />
      <title>{data.site.siteMetadata.title}</title>
    </>
  )
}

export const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`

export default NotFoundPage
