import React from "react"

import Header from "./header"
import Footer from "./footer"

import "../styles/global.css"

const Layout = ({
  children,
  currentLang,
  availLangs,
  pagePath,
  pageLayout,
}) => {
  return (
    <>
      <Header
        currentLang={currentLang}
        availLangs={availLangs}
        pagePath={pagePath}
        pageLayout={pageLayout}
      />
      <main>
        <div className="container">{children}</div>
      </main>
      <Footer currentLang={currentLang} />
    </>
  )
}

export default Layout
