import React from "react"
import { Link } from "gatsby"

import * as styles from "../styles/pagination.module.css"

const Pagination = ({ tagSlug = "", pageContext }) => {
  const currentLang = pageContext.language

  return (
    <nav className={styles.pagination} role="navigation" aria-label="post">
      {pageContext.currentPage !== 1 && (
        <Link
          to={`/${currentLang}${tagSlug ? `/tag/${tagSlug}` : ""}/`}
          className={styles.paginationNumbers}
        >
          1
        </Link>
      )}
      {pageContext.currentPage > 4 && (
        <span className={`${styles.paginationNumbers} ${styles.dots}`}>…</span>
      )}
      {pageContext.currentPage > 3 && (
        <Link
          to={`/${currentLang}${tagSlug ? `/tag/${tagSlug}` : ""}/page/${
            pageContext.currentPage - 2
          }/`}
          className={styles.paginationNumbers}
        >
          {pageContext.currentPage - 2}
        </Link>
      )}
      {pageContext.currentPage > 2 && (
        <Link
          to={`/${currentLang}${tagSlug ? `/tag/${tagSlug}` : ""}/page/${
            pageContext.currentPage - 1
          }/`}
          className={styles.paginationNumbers}
        >
          {pageContext.currentPage - 1}
        </Link>
      )}
      <span
        aria-current="page"
        className={`${styles.paginationNumbers} ${styles.current}`}
      >
        {pageContext.currentPage}
      </span>
      {pageContext.currentPage + 1 < pageContext.pages && (
        <Link
          to={`/${currentLang}${tagSlug ? `/tag/${tagSlug}` : ""}/page/${
            pageContext.currentPage + 1
          }/`}
          className={styles.paginationNumbers}
        >
          {pageContext.currentPage + 1}
        </Link>
      )}
      {pageContext.currentPage + 2 < pageContext.pages && (
        <Link
          to={`/${currentLang}${tagSlug ? `/tag/${tagSlug}` : ""}/page/${
            pageContext.currentPage + 2
          }/`}
          className={styles.paginationNumbers}
        >
          {pageContext.currentPage + 2}
        </Link>
      )}
      {pageContext.currentPage + 3 < pageContext.pages && (
        <span className={`${styles.paginationNumbers} ${styles.dots}`}>…</span>
      )}
      {!pageContext.isLast && (
        <Link
          to={`/${currentLang}${tagSlug ? `/tag/${tagSlug}` : ""}/page/${
            pageContext.pages
          }/`}
          className={styles.paginationNumbers}
        >
          {pageContext.pages}
        </Link>
      )}
    </nav>
  )
}

export default Pagination
