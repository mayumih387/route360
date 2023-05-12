import React, { useState, useContext } from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import ThemeContext from "../context/ThemeContext"

import * as classes from "../styles/header.module.css"

const Header = ({
  currentLang = "en",
  availLangs = ["en", "fr", "ja"],
  pagePath = "",
}) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  const ctx = useContext(ThemeContext)

  const [showLangSelector, setShowLangSelector] = useState(false)

  const clickHandler = () => {
    setShowLangSelector(prevState => !prevState)
  }

  const langName = {
    en: "English",
    fr: "français",
    ja: "日本語",
  }

  return (
    <header>
      <div className={classes.headerContainer}>
        <Link to={`/${currentLang}/`} className={classes.logo}>
          {data.site.siteMetadata.title}
        </Link>
        <nav className={classes.nav}>
          <button
            type="button"
            onClick={ctx.toggleDark}
            className={classes.themeBtn}
            aria-label="Theme Switcher"
          >
            {ctx.isDarkMode ? (
              <svg
                viewBox="0 0 24 24"
                fill="var(--primary-font-color)"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.6 14.6A8 8 0 0 1 9.4 4.4a8 8 0 1 0 10.2 10.2Z"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="var(--primary-font-color)"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H3m9-7V3m9 9h-2m-7 9v-2m5-2 1.4 1.4M5.6 5.6l1.5 1.5m9.8 0 1.5-1.5M5.6 18.4l1.5-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <button
            className={classes.langBtn}
            onClick={clickHandler}
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21a9 9 0 1 0 0-18m0 18a9 9 0 1 1 0-18m0 18a13 13 0 0 1-4-9 13 13 0 0 1 4-9m0 18a13 13 0 0 0 4-9 13 13 0 0 0-4-9m8 6H4m16 6H4"
                stroke="var(--primary-font-color)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={classes.langName}>{langName[currentLang]}</span>
            {showLangSelector && (
              <ul className={classes.langSelecter}>
                {availLangs.map(lang => (
                  <li key={lang}>
                    <Link
                      to={`/${lang}/${pagePath}`}
                      rel="alternate"
                      hrefLang={lang}
                      className={
                        lang === currentLang ? classes.yellow : classes.normal
                      }
                    >
                      {langName[lang]}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header
