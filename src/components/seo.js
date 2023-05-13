import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import { siteDesc, siteLocale } from "../../data/i18n"

const Seo = props => {
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            author
            siteUrl
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
        fileProf: file(name: { eq: "profile" }) {
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
  )

  const currentLang = props.currentLang || "en"

  const title = props.pageTitle
    ? `${props.pageTitle}`
    : `${data.site.siteMetadata.title} - ${siteDesc[currentLang]}`

  const description = props.pageDesc || siteDesc[currentLang]

  const url = props.pagePath
    ? `${data.site.siteMetadata.siteUrl}${props.pagePath}`
    : `${data.site.siteMetadata.siteUrl}/en/`

  const type = props.pageType ? props.pageType : `website`

  const imgurl = `${data.site.siteMetadata.siteUrl}${data.fileLogo.childImageSharp.original.src}`

  const imgw = data.fileLogo.childImageSharp.original.width
  const imgh = data.fileLogo.childImageSharp.original.height

  const baseSchema = [
    {
      "@type": "WebSite",
      "@id": `${data.site.siteMetadata.siteUrl}/${currentLang}/#website`,
      url: `${data.site.siteMetadata.siteUrl}/${currentLang}/`,
      name: data.site.siteMetadata.title,
      description: description,
      publisher: {
        "@id": `${data.site.siteMetadata.siteUrl}/${currentLang}/#/schema/person`,
      },
      inLanguage: currentLang,
    },
    {
      "@type": ["Person", "Organization"],
      "@id": `${data.site.siteMetadata.siteUrl}/${currentLang}/#/schema/person`,
      name: data.site.siteMetadata.author,
      image: {
        "@type": "ImageObject",
        inLanguage: currentLang,
        "@id": `${data.site.siteMetadata.siteUrl}/${currentLang}/#/schema/person/image/`,
        url:
          data.site.siteMetadata.siteUrl +
          data.fileProf.childImageSharp.original.src,
        contentUrl:
          data.site.siteMetadata.siteUrl +
          data.fileProf.childImageSharp.original.src,
        width: data.fileProf.childImageSharp.original.width,
        height: data.fileProf.childImageSharp.original.height,
        caption: data.site.siteMetadata.author,
      },
      logo: {
        "@id": `${data.site.siteMetadata.siteUrl}/${currentLang}/#/schema/person/image/`,
      },
      description: description,
    },
  ]

  const schema = {
    "@context": "https://schema.org",
    "@graph": [...(props.pageSchema || ""), ...baseSchema],
  }

  const availLangs = props.availLangs || ["ja", "en", "fr"]

  const alternateUrls = {}
  availLangs.map(
    lang => (alternateUrls[lang] = url.replace(/\/([a-z]{2})\//, `/${lang}/`))
  )

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {Object.keys(alternateUrls).length > 0 &&
        Object.keys(alternateUrls).map(lang => (
          <link
            rel="alternate"
            hrefLang={lang}
            href={alternateUrls[lang]}
            key={lang}
          />
        ))}

      {Object.keys(alternateUrls).length > 0 &&
        ("en" in alternateUrls ? (
          <link
            rel="alternate"
            hrefLang="x-default"
            href={alternateUrls["en"]}
          />
        ) : (
          <link rel="alternate" hrefLang="x-default" href={url} />
        ))}

      <meta property="og:site_name" content={data.site.siteMetadata.title} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={imgurl} />
      <meta property="og:image:width" content={imgw} />
      <meta property="og:image:height" content={imgh} />

      {alternateUrls.length > 0 &&
        availLangs.map(lang => (
          <meta
            property="og:locale:alternate"
            content={siteLocale[lang]}
            key={lang}
          />
        ))}

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </>
  )
}

export default Seo
