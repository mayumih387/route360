---
title: Générer un plan de site XML pour un site Gatsby multilingue
tags:
  - gatsbyjs
  - internationalization
  - markdown
  - seo
date: 2023-05-25T01:00:00.000Z
lastmod: 2023-05-26T01:00:00.000Z
draft: false
---

Ce blog (route360.dev) est un site web multilingue généré par Gatsby.js.

Dans cet article, je vais expliquer comment personnaliser le sitemap xml avec le [gatsby-plugin-sitemap](https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/), un plugin officiel de Gatsby.

Consultez [le dépôt de ce blog](https://github.com/mayumih387/route360) si vous êtes intéressés. Le code de cet article est simplifié pour des raisons d'explication.

Environnement:

- gatsby v5.10.0
- gatsby-plugin-sitemap v6.10.0
- react v18.2.0
- node v18.16.0

## Prérequis

Je parle d'un site web avec un contenu Markdown. Dans le cas d'un CMS, réécrivez votre propre `query`.

### Chemins URL

Les chemins URL de ce blog sont les suivants ;

- Pages à entrée unique `/[lang]/post/[slug]/`
- Pages individuelles `/[lang]/[slug]/` \*ex. about page
- Pages d'archives d'étiquettes `/[lang]/tag/[slug]/`
- Pages d'archives d'étiquettes (après la page 2) `/[lang]/tag/[slug]/page/[num]/`
- Page d'accueil `/[lang]/`
- Page d'accueil (après la page 2) `/[lang]/page/[num]/`

Clés :

- Les chemins d'accès aux pages traduites partagent le même slug
- Le code de la langue est placé juste après le domaine racine

Pour les cas où les pages de traduction ont leur propre slug ou que le code langue par défaut n'apparaît pas dans l'URL, modifiez le code de l'exemple en conséquence.

Je prends également en compte les cas où le nombre total de pages varie en fonction de la langue.

## Objectif

L'objectif est de générer un plan du site (sitemap) comme indiqué dans les [directives de Google](https://developers.google.com/search/docs/specialty/international/localized-versions?hl=fr#sitemap) comme suit ;

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://www.example.com/english/page.html</loc>
    <xhtml:link
               rel="alternate"
               hreflang="de"
               href="https://www.example.de/deutsch/page.html"/>
    <xhtml:link
               rel="alternate"
               hreflang="de-ch"
               href="https://www.example.de/schweiz-deutsch/page.html"/>
    <xhtml:link
               rel="alternate"
               hreflang="en"
               href="https://www.example.com/english/page.html"/>
  </url>
  <url>
    <loc>https://www.example.de/deutsch/page.html</loc>
    <xhtml:link
               rel="alternate"
               hreflang="de"
               href="https://www.example.de/deutsch/page.html"/>
    <xhtml:link
               rel="alternate"
               hreflang="de-ch"
               href="https://www.example.de/schweiz-deutsch/page.html"/>
    <xhtml:link
               rel="alternate"
               hreflang="en"
               href="https://www.example.com/english/page.html"/>
  </url>
  <url>
    <loc>https://www.example.de/schweiz-deutsch/page.html</loc>
    <xhtml:link
               rel="alternate"
               hreflang="de"
               href="https://www.example.de/deutsch/page.html"/>
    <xhtml:link
               rel="alternate"
               hreflang="de-ch"
               href="https://www.example.de/schweiz-deutsch/page.html"/>
    <xhtml:link
               rel="alternate"
               hreflang="en"
               href="https://www.example.com/english/page.html"/>
  </url>
</urlset>
```

## Code

Voici le code.

<div class="filename">gatsby-config.js</div>

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        query: `
        {
          site {
            siteMetadata {
              siteUrl
            }
          }
          allSitePage {
            nodes {
              path
            }
          }
        }`,
        resolvePages: ({ allSitePage: { nodes: allPages } }) => {
          const pages = allPages.map(page => {
            const alternateLangs = allPages
              .filter(
                alterPage =>
                  alterPage.path.replace(/\/.*?\//, "/") ===
                  page.path.replace(/\/.*?\//, "/")
              )
              .map(alterPage => alterPage.path.match(/^\/([a-z]{2})\//))
              .filter(match => match)
              .map(match => match[1])

            return {
              ...page,
              ...{ alternateLangs },
            }
          })

          return pages
        },
        serialize: ({ path, alternateLangs }) => {
          const pagepath = path.replace(/\/.*?\//, "/")

          const xhtmlLinks =
            alternateLangs.length > 1 &&
            alternateLangs.map(lang => ({
              rel: "alternate",
              hreflang: lang,
              url: `/${lang}${pagepath}`,
            }))

          let entry = {
            url: path,
            changefreq: "daily",
            priority: 0.7,
          }

          if (xhtmlLinks) {
            entry.links = xhtmlLinks
          }

          return entry
        },
      },
    },
  ],
}
```

\*[Le code actuel de ce blog](https://github.com/mayumih387/route360/blob/main/gatsby-config.js) est plus compliqué car j'ai ajouté lastmod pour chaque article.

## Exemple de sortie de plan du site

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
  <url>
    <loc>https://route360.dev/en/post/gatsby-i18n/</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://route360.dev/en/post/gatsby-i18n/" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://route360.dev/fr/post/gatsby-i18n/" />
    <xhtml:link rel="alternate" hreflang="ja" href="https://route360.dev/ja/post/gatsby-i18n/" />
  </url>
  <url>
    <loc>https://route360.dev/en/post/codeium/</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://route360.dev/en/post/codeium/" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://route360.dev/fr/post/codeium/" />
    <xhtml:link rel="alternate" hreflang="ja" href="https://route360.dev/ja/post/codeium/" />
  </url>
  <!-- omitted below -->
</urlset>
```

[Le plan du site de ce blog se trouve ici](https://route360.dev/sitemap-0.xml).

## Ce que je fais dans le code

L'aperçu du code ci-dessus :

1. Répartir tous les chemins de page, et assigner le(s) code(s) de langue du même slug (y compris lui-même) de chaque chemin dans un tableau nommé `alternateLangs`
2. Si `alternateLangs` (longueur du numéro de la locale) est plus à 2, ajoutez `<xhtml:link rel="alternate" hreflang="lang_code" href="page_path" />` à l'élément url.

### Générer un tableau de code(s) linguistique(s) pour chaque chemin

Tout d'abord, la première partie.

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        // ...

        resolvePages: ({ allSitePage: { nodes: allPages } }) => {
          const pages = allPages.map(page => {
            const alternateLangs = allPages
              // Extraire les pages traduites (y compris l'URL elle-même) pour chaque chemin d'URL
              // ex) /en/first-post/ et /ja/first-post/ -> true
              .filter(
                alterPage =>
                  alterPage.path.replace(/\/.*?\//, "/") ===
                  page.path.replace(/\/.*?\//, "/")
              )
              // Obtenir les codes de langue à partir des chemins d'accès aux pages traduites et les convertir en tableau
              .map(alterPage => alterPage.path.match(/^\/([a-z]{2})\//))
              // Éliminer null *.filter(Boolean) fonctionne également
              .filter(match => match)
              // Codes de langue en tableau uniquement
              .map(match => match[1])

            return {
              ...page,
              ...{ alternateLangs }, // Ajouter le tableau des codes de langue
            }
          })

          return pages
        },

        // ...
      },
    },
  ],
}
```

J'obtiens la chaîne suivante à partir de chemins d'URL à l'aide d'expressions régulières ;

- code(s) langue(s)
- Chemins d'URL sans leur code de langue dans l'URL

Dans le cas de ce blog, je pourrais obtenir les codes de langue à partir de pageContext ou les slugs à partir de markdownRemark parce que je les ai ajoutés dans `gatsby-node.js`. Je ne l'ai pas fait dans ce code pour des raisons d'explication et de polyvalence.

Si vous utilisez un CMS, vous pouvez obtenir le code de la langue de l'article à partir de GraphQL.

### Ajouter xhtml:link seulement si le nombre de langues est de 2 ou plus

Ensuite, la deuxième partie.

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        //...

        serialize: ({ path, alternateLangs }) => {
          // Obtenir le chemin d'accès à la page sans code langue
          const pagepath = path.replace(/\/.*?\//, "/")

          // Générer du xhtml pour les pages traduites (y compris l'URL elle-même)
          const xhtmlLinks =
            alternateLangs.length > 1 && // Si le nombre de traductions est égal ou plus à 2
            alternateLangs.map(lang => ({
              rel: "alternate",
              hreflang: lang,
              url: `/${lang}${pagepath}`,
            }))

          // Élément <url> par défaut
          let entry = {
            url: path,
            changefreq: "daily",
            priority: 0.7,
          }

          // Ajouter l'élément enfant <xhtml:link rel="alternate" hreflang="lang"> à <url> si des traductions sont disponibles
          if (xhtmlLinks) {
            entry.links = xhtmlLinks
          }

          return entry
        },
      },
    },
  ],
}
```

Avec le code ci-dessus, `<xhtml:link rel="alternate" hreflang="lang">` sous `<url>` est généré et ajouté uniquement lorsque des traductions sont disponibles.

C'est tout !

## Réferences

- [Signaler les versions localisées de votre page à Google | Google for developers](https://developers.google.com/search/docs/specialty/international/localized-versions?hl=fr#sitemap)
- [gatsby-plugin-sitemap | Gatsby](https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/)
