import React from "react"
import { Link } from "gatsby"

import * as classes from "../styles/footer.module.css"

const Footer = ({ currentLang }) => {
  return (
    <footer>
      <div className={classes.footerContainer}>
        <ul className={classes.menu}>
          <li>
            <a
              href="https://twitter.com/route360dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 -2 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.3 16C13.8 16 18 9.8 18 4.5V4c.8-.6 1.4-1.3 2-2.1-.7.3-1.5.5-2.4.6A4 4 0 0 0 19.4.3c-.8.5-1.6.8-2.6 1A4.2 4.2 0 0 0 11 1 4 4 0 0 0 9.8 5C6.5 4.8 3.5 3.3 1.4.7a4 4 0 0 0 1.3 5.4C2 6.1 1.4 6 .8 5.6a4 4 0 0 0 3.3 4c-.6.2-1.2.2-1.9.1.6 1.7 2.1 2.8 3.9 2.8A8.3 8.3 0 0 1 0 14.2C1.9 15.4 4 16 6.3 16"
                  fill="var(--primary-font-color)"
                  fillRule="evenodd"
                />
              </svg>
              <span className="sr-only">Twitter</span>
            </a>
          </li>
          <li>
            <a
              href="https://github.com/mayumih387/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 0c5.5 0 10 4.6 10 10.3 0 4.5-2.9 8.3-6.8 9.7-.5 0-.7-.2-.7-.5v-2.8c0-1-.3-1.6-.7-2 2.2-.2 4.6-1 4.6-5a4 4 0 0 0-1-2.7c0-.3.4-1.3-.1-2.7 0 0-.9-.3-2.8 1a9.4 9.4 0 0 0-5 0c-2-1.3-2.8-1-2.8-1a3.8 3.8 0 0 0 0 2.7 4 4 0 0 0-1 2.7c0 4 2.3 4.8 4.5 5-.3.3-.6.8-.7 1.5-.5.2-2 .7-2.9-.9 0 0-.5-1-1.5-1 0 0-1 0 0 .6 0 0 .6.3 1 1.5 0 0 .6 1.8 3.4 1.2v1.9c0 .3-.2.6-.7.5-4-1.4-6.8-5.2-6.8-9.7C0 4.6 4.5 0 10 0"
                  fill="var(--primary-font-color)"
                  fillRule="evenodd"
                />
              </svg>
              <span className="sr-only">Github</span>
            </a>
          </li>
        </ul>
        <ul className={classes.menu}>
          <li>
            <Link to={`/${currentLang}/about/`}>About</Link>
          </li>
          <li>
            <Link to={`/${currentLang}/contact/`}>Contact</Link>
          </li>
          <li>
            <Link to={`/${currentLang}/privacy-policy/`}>Privacy Policy</Link>
          </li>
        </ul>
        <p className={classes.copyright}>© Route360 All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
