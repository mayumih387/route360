import React from "react"
import { Link } from "gatsby"

import * as classes from "../styles/post-body.module.css"

const PostBody = ({ markdownRemark, currentLang = "en" }) => {
  const tocTitle = {
    en: "Table of Contents",
    fr: "Table des matières",
    ja: "目次",
  }

  return (
    <article>
      <header className={classes.header}>
        <ul className={classes.meta}>
          <li className={classes.date}>
            <time dateTime={markdownRemark.frontmatter.date}>
              {currentLang === "en" && markdownRemark.frontmatter.dateEN}
              {currentLang === "fr" && markdownRemark.frontmatter.dateFR}
              {currentLang === "ja" && markdownRemark.frontmatter.dateJP}
            </time>
          </li>
          {markdownRemark.frontmatter?.lastmod >
            markdownRemark.frontmatter.date && (
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
              <time dateTime={markdownRemark.frontmatter.lastmod}>
                {currentLang === "en" && markdownRemark.frontmatter.lastmodEN}
                {currentLang === "fr" && markdownRemark.frontmatter.lastmodFR}
                {currentLang === "ja" && markdownRemark.frontmatter.lastmodJP}
              </time>
            </li>
          )}
        </ul>
        <h1>{markdownRemark.frontmatter.title}</h1>
        {markdownRemark.frontmatter?.tags && (
          <ul className={classes.tags}>
            {markdownRemark.frontmatter.tags.map((tag) => (
              <li key={tag.id} className={classes.tag}>
                #{" "}
                <Link to={`/${currentLang}/tag/${tag.slug}`}>{tag.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </header>
      {markdownRemark.tableOfContents && (
        <details className={classes.toc}>
          <summary className={classes.tocHeader}>
            <div>{tocTitle[currentLang]}</div>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={classes.tocBtn}
            >
              <path
                d="m4 8 8 8 8-8"
                stroke="var(--secondary-font-color)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>
          <div
            dangerouslySetInnerHTML={{
              __html: markdownRemark.tableOfContents,
            }}
            className={classes.tocList}
          />
        </details>
      )}
      <div
        className={classes.stack}
        dangerouslySetInnerHTML={{ __html: markdownRemark.html }}
      />
    </article>
  )
}

export default PostBody
