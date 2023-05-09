import React from "react"
import { Link } from "gatsby"

import * as classes from "../styles/prev-next.module.css"

const PrevNext = ({ next = "", previous = "", currentLang = "en" }) => {
  return (
    <ul className={classes.prevNext}>
      {next && (
        <li>
          <Link
            to={`/${currentLang}/post/${next.fields.slug}/`}
            className={classes.link}
          >
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              width="2em"
            >
              <path
                d="M11 8.5a.7.7 0 1 0-1-1l-4 4a.7.7 0 0 0 0 1l4 4a.7.7 0 1 0 1-1l-2.7-2.8H18a.8.8 0 0 0 0-1.4H8.3L11 8.4Z"
                fill="var(--primary-font-color)"
              />
            </svg>
            <span>{next.frontmatter.title}</span>
          </Link>
        </li>
      )}
      {previous && (
        <li>
          <Link
            to={`/${currentLang}/post/${previous.fields.slug}/`}
            className={`${classes.link}`}
          >
            <span>{previous.frontmatter.title}</span>
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              width="2em"
            >
              <path
                d="M13.5 8.5a.7.7 0 0 1 1-1l4 4c.3.3.3.7 0 1l-4 4a.7.7 0 1 1-1-1l2.7-2.8H6.5a.8.8 0 0 1 0-1.4h9.7l-2.7-2.8Z"
                fill="var(--primary-font-color)"
              />
            </svg>
          </Link>
        </li>
      )}
    </ul>
  )
}

export default PrevNext
