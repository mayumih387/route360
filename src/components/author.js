import React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import * as classes from "../styles/author.module.css"

const Author = ({ currentLang = "en" }) => {
  const desc = {
    en: "Hi! I'm a frontend developer (she/her).",
    fr: "Bonjour! Je suis une développeuse frontend (elle).",
    ja: "ウェブサイト制作・フロントエンドの開発をしています。",
  }

  const more = {
    en: "Read more",
    fr: "Lire la suite",
    ja: "詳しく読む",
  }

  return (
    <aside className={classes.author}>
      <StaticImage
        src="../images/profile.jpg"
        alt="I am the author."
        placeholder="blurred"
        width={300}
        className={classes.avatar}
      />
      <div>
        <p>Mayumi Hara</p>
        <p>
          {desc[currentLang]}
          {""}
          <Link to={`/${currentLang}/about/`}>{more[currentLang]}</Link>
        </p>
      </div>
    </aside>
  )
}

export default Author
