---
title: Créer un blog multilingue facilement avec Gatsby.js + Markdown
tags:
  - gatsbyjs
  - internationalization
  - markdown
date: 2023-05-18T01:00:00.000Z
lastmod: 2023-05-26T02:57:45.864Z
draft: false
---

Ce site est un blog en 3 langues développé avec Gatsby.js. Il est réalisé **sans aucun plugin ou module i18n**, mais uniquement avec le routage de gatsby-node.js. \*Il a fonctionné avec Next.js jusqu'en avril 2023.

Gatsby.js n'a pas de fonction intégrée pour obtenir la langue par défaut ou la langue d'affichage actuelle, comme `useRouter()` de Next.js. Il n'y a pas non plus de distinction entre la "langue par défaut" et les "autres langues" dans les paramètres.

Cet article vous montrera comment j'ai internationalisé (i18n) ce site, les étapes à suivre et les points clés. Il existe probablement d'autres méthodes d'internationalisation, mais je vous invite à lire cet article à titre d'exemple.

Le code de ce blog est publié sur [GitHub repository](https://github.com/mayumih387/route360).

## Points clés pour la création d'un site multilingue avec Gatsby.js

1. générer des pages par langue avec `gatsby-node.js`
2. passer la langue actuelle à `pageContext` dans la première étape
3. Dans chaque template, récupérer la langue actuelle dans `pageContext` et la passer à des composants tels que Header et Footer pour qu'ils s'affichent différemment pour chaque langue.

De cette façon, vous pouvez créer un site multilingue avec Gatsby.js sans avoir besoin de plugins i18n.

## Structure des fichiers Markdown

Les fichiers Markdown sont organisés comme suit ;

```tree
src/
├─ content/
| └─ posts/
|    ├─ first-post/
|    |    ├─ en.md
|    |    ├─ fr.md
|    |    └─ ja.md
|    ├─ second-post/
|    |    ├─ en.md
|    |    ├─ fr.md
|    |    └─ ja.md
```

J'utilise le nom du dossier comme slug et je nomme les fichiers `[lang].md` pour chaque langue. En faisant cela, j'évite d'avoir à ajouter le slug et le code de la langue aux métadonnées du frontmatter et à chaque nom de fichier.

Par conséquent, dans `gatsby-node.js`, j'ajoute le schéma `slug` et `language` avec le code suivant pour que la requête GraphQL dans chaque post (MarkdownRemark) puisse récupérer le nom de fichier (en tant que slug) et la langue.

<div class="filename">gatsby-node.js</div>

```js
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === "MarkdownRemark") {
    const fileNode = getNode(node.parent)

    createNodeField({
      node,
      name: "language",
      value: fileNode.name,
    })

    createNodeField({
      node,
      name: "slug",
      value: fileNode.relativeDirectory.match(/\/(.+)/)[1],
    })
  }
}
```

Lien - [onCreateNode | Gatsby.js](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#onCreateNode)

Le code ci-dessus vous permettra d'obtenir le nom de la langue et le slug de chaque article à partir d'une requête GraphQL. Bien évidemment, il peut également être utilisé pour le filtrage et le tri.

```graphql
query {
  markdownRemark {
    fields {
      language
      slug
    }
    frontmatter {
      ...
    }
  }
}
```

## Comment créer des paths et générer des pages par langue

Ensuite, nous allons utiliser `gatsby-node.js` pour créer les paths pour les pages que nous voulons créer.

C'est un peu pénible, mais la requête doit être générée en fonction de la langue.

- Nom du template pour un article individuel : post.js
- Nom du template pour la page d'accueil (tous les articles) : index.js

En générant des requêtes par langue, nous pouvons obtenir les avantages suivants :

- La pagination est plus facile lorsque le nombre d'articles dans chaque langue est différent.
- Les articles précédents/suivants peuvent être récupérés par langue.

### Générer des pages d'articles individuelles

<div class="filename">gatsby-node.js</div>

```js
exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const blogresult = await graphql(`
    query {
      allPostsEN: allMarkdownRemark(
        filter: { fields: { language: { eq: "en" } } }
        sort: { frontmatter: { date: DESC } }
      ) {
        edges {
          node {
            id
            fields {
              slug
            }
          }
        }
      }
      allPostsFR: allMarkdownRemark(
        filter: { fields: { language: { eq: "fr" } } }
        sort: { frontmatter: { date: DESC } }
      ) {
        edges {
          node {
            id
            fields {
              slug
            }
          }
        }
      }
      allPostsJA: allMarkdownRemark(
        filter: { fields: { language: { eq: "ja" } } }
        sort: { frontmatter: { date: DESC } }
      ) {
        edges {
          node {
            id
            fields {
              slug
            }
          }
        }
      }
    }
  `)

  if (blogresult.errors) {
    reporter.panicOnBuild(`Query error!`)
    return
  }

  // Single Post Pages
  const allPosts = {
    en: blogresult.data.allPostsEN,
    fr: blogresult.data.allPostsFR,
    ja: blogresult.data.allPostsJA,
  }

  Object.keys(allPosts).forEach(key => {
    allPosts[key].edges.forEach(({ node }) => {
      createPage({
        path: `/${key}/post/${node.fields.slug}/`,
        component: require.resolve(`./src/templates/post.js`),
        context: {
          id: node.id,
          slug: node.fields.slug,
          language: key,
        },
      })
    })
  })
}
```

Je n'expliquerai pas la pagination ici, mais la possibilité que le nombre total de billets soit différent d'une langue à l'autre doit également être prise en compte.

Si une page d'inscription contient une cinquième page en français mais seulement quatre pages en anglais, la prise en compte des requêtes par langue permettra d'éviter la création d'une page inutile.

### Créer la page de liste d'articles

Ensuite, ajoutez le code pour créer une page de liste d'articles, comme indiqué sur la [première page de ce blog](/fr/).

<div class="filename">gatsby-node.js</div>

```js
exports.createPages = async ({ actions, graphql, reporter }) => {
  //...

  // Index Pages
  Object.keys(allPosts).forEach(key => {
    createPage({
      path: `/${key}/`,
      component: require.resolve(`./src/templates/index.js`),
      context: {
        language: key,
      },
    })
  })
}
```

À titre de référence, ce blog, qui comprend une fonction de pagination, effectue les opérations suivantes ([le dépôt](https://github.com/mayumih387/route360/blob/main/gatsby-node.js));

<div class="filename">gatsby-node.js</div>

```js
exports.createPages = async ({ actions, graphql, reporter }) => {
  // Ajouter la requête totalCount à const blogresult

  const postsPerPage = 5
  // Pages d'index
  Object.keys(allPosts).forEach(key => {
    const totalPages = Math.ceil(allPosts[key].totalCount / postsPerPage)
    for (let i = 0; i < totalPages; i++) {
      createPage({
        path: i === 0 ? `/${key}/` : `/${key}/page/${i + 1}/`,
        component: require.resolve(`./src/templates/index.js`),
        context: {
          language: key,
          skip: postsPerPage * i,
          limit: postsPerPage,
          currentPage: i + 1, //numéro de la page actuelle
          isFirst: i + 1 === 1, //s'il s'agit de la première page
          isLast: i + 1 === totalPages, //s'il s'agit de la dernière page
          pages: totalPages,
        },
      })
    }
  })
}
```

## Comment déterminer la langue d'affichage actuelle et les articles traduits

Cette section décrit la création sur les pages d'articles de billets individuels. Le même concept (obtenir la langue d'affichage) peut être utilisé pour générer des pages de listes d'articles.

### Obtenir la langue d'affichage

Dans la génération de la page de `gatsby-node.js` mentionnée plus haut, j'ai ajouté `language` à la propriété `context` pour envoyer le code de la langue comme valeur.

Ce code sera disponible dans le template en tant que `pageContext` pour récupérer les données.

<div class="filename">src/template/post.js</div>

```js
const SinglePost = ( { pageContext } ) => {
  const currentLang = pageContext.language

  return (
    //...
  )
}
```

Cette valeur peut être envoyée à chaque composant et utilisée pour basculer l'affichage par langue dans le Header et le Footer.

### Vérifier la présence d'articles traduits

Vous pouvez vérifier s'il existe des traductions de l'article actuellement affiché, également dans le template.

La génération de la page `gatsby-node.js` inclut le slug de la page générée dans la propriété `context`, ainsi l'article correspondant avec le slug peut être récupéré dans `allMarkdownRemark`.

La requête récupérée est développée dans jsx par `map()` et stockée sous forme de tableau dans la constante `availLangs`.

<div class="filename">src/template/post.js</div>

```js
const SinglePost = ( { pageContext, data } ) => {
  const currentLang = pageContext.language

  const availLangs = data.allMarkdownRemark.nodes.map(
    node => node.fields.language
  )

  return (
    //...
  )
}

export const query = graphql`
  query($id: String!, $slug: String!) {
    markdownRemark(id: { eq: $id }) {
      ... // Current post data
    }
    allMarkdownRemark(
      filter: { fields: { slug: { eq: $slug } } }
      sort: { fields: { language: ASC } }
    ) {
      nodes {
        id
        fields {
          language
        }
      }
    }
  }
`
```

De cette façon, le paramètre `availLangs` est envoyé au composant du sélecteur de langue et le lien n'est affiché dans le sélecteur que si une traduction est disponible.

\*Je n'entrerai pas dans la création du sélecteur de langue ici.

### Ajouter l'attribut lang aux balises html dans Gatsby Head API

Gatsby.js vous permet d'envoyer des données dynamiques aux balises `<html>` et `<body>` en utilisant `Gatsby Head API` dans chaque modèle.

Comme pour la description JSX du template, la langue courante est récupérée à partir du `pageContext` et l'attribut language de la balise `<html>` peut être spécifié.

<div class="filename">src/template/post.js</div>

```js
export const Head = ({ pageContext }) => {
  const currentLang = pageContext.language

  return <html lang={currentLang} />
}
```

Lien - [Gatsby Head API](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/)

### Pour la page de liste d'articles

Dans le cas des pages de liste d'articles, telles que la page d'accueil et les pages de tags, la langue d'affichage actuelle est transmise à la propriété `context` dans `gatsby-node.js`, de sorte qu'elles peuvent être créées de la même manière en utilisant l'approche ci-dessus.

## Création de la page d'accueil et de la page 404 dans différentes langues　

### Processus de redirection vers la page d'accueil

La page d'accueil pour chaque langue a été créée dans `gatsby-node.js` plus tôt pour chaque langue, mais l'URL du domaine racine doit être gérée.

Lorsque je l'ai créée avec Next.js, `https://route360.dev/` était la page d'accueil en anglais. Donc maintenant, si on accède à cette URL, elle sera redirigée vers `https://route360.dev/en/`.

L'hébergement est [Cloudflare Pages](https://www.cloudflare.com/ja-jp/products/pages/). La configuration de la redirection est la suivante. \*La même configuration devrait fonctionner pour [Netlify](https://www.netlify.com/).

<div class="filename">src/static/_redirects</div>

```text
/ /en 301
```

### Affichage de la page 404

Comme Cloudflare Pages ne prend pas en charge les redirections personnalisées (Netlify le fait), j'ai créé la page 404 comme suit ; (le code réel ci-dessous est modifié pour des raisons d'illustration)

<div class="filename">src/pages/404.js</div>

```js
const NotFoundPage = ({ location }) => {
  const browserLang = location.pathname.slice(1, 3)

  const languageMap = {
    ja: "ja",
    fr: "fr",
    en: "en",
  }

  const backToHome = {
    en: "Back to Home",
    fr: "Retour à la page d'accueil",
    ja: "ホームに戻る",
  }

  let currentLang = languageMap[browserLang] || languageMap["en"]

  return (
    <Layout currentLang={currentLang}>
      <div className={classes.postsContainer}>
        <p>404 Not Found</p>
        <Link to={`/${currentLang}/`}>{backToHome[currentLang]}</Link>
      </div>
    </Layout>
  )
}
```

Si le chemin d'accès à la page 404 contient un code de langue tel que `/en/`, j'affiche "Return to Home" dans cette langue. Si ce n'est pas le cas, c'est en anglais.

\*Avec l'évaluation ci-dessus, si les deuxième et troisième caractères sont `en` comme `length`, il sera évalué comme `English`. Si vous souhaitez évaluer le path de manière plus stricte, veuillez réécrire le code en conséquence.

## Mettre en place des balises méta spécifiques à la langue dans les headers (pour le SEO)

À des fins de SEO, s'il y a des pages traduites, ajoutez du code dans la balise `<head>` concernant la disponibilité des traductions et des pages de langue par défaut.

Dans ce site, nous envoyons les données `availLangs` dans le composant SEO via l'API Gatsby Head et ajoutons les données suivantes seulement s'il y a une traduction/des traductions.

### Notifier à Google la version localisée de la page

```html
<link rel="alternate" hreflang="language_code" href="current_url" />
```

Tout est expliqué dans le guide de Google [Signaler les versions localisées de votre page à Google](https://developers.google.com/search/docs/specialty/international/localized-versions?hl=fr#html).

### Métadonnées pour OGP (Open Graph Protocol)

```html
<meta property="og:locale:alternate" content="language_code" />
```

Ajouter également des métadonnées pour l'OGP.

## Créer des flux RSS par langue

Utilisez [gatsby-plugin-feed](https://www.gatsbyjs.com/plugins/gatsby-plugin-feed/) pour générer des flux RSS pour chaque langue.

\*Le code suivant est quelque peu simplifié à des fins d'explication.

<div class="filename">gatsby-config.js</div>

```js
{
  resolve: `gatsby-plugin-feed`,
  options: {
    query: `
      {
        site {
          siteMetadata {
            title
            siteUrl
          }
        }
      }
    `,
    feeds: [
      {
        serialize: ({ query: { site, allMarkdownRemark } }) => {
          return allMarkdownRemark.nodes.map(node => {
            return Object.assign({}, node.frontmatter, {
              description: node.excerpt,
              date: node.frontmatter.date,
              url: `${site.siteMetadata.siteUrl}/en/post/${node.fields.slug}/`,
              guid: `${site.siteMetadata.siteUrl}/en/post/${node.fields.slug}/`,
            })
          })
        },
        query: `
          {
            allMarkdownRemark(
              filter: {
                fields: { language: { eq: "en" } }
              }
              sort: { frontmatter: { date: DESC } }
              limit: 10
            ) {
              nodes {
                excerpt
                frontmatter {
                  title
                  date
                }
                fields {
                  slug
                }
              }
            }
          }
        `,
        output: "/rss.en.xml",
        title: "Route360",
        description: "Blog by a frontend developer",
        site_url: "https://route360.dev/en/",
        feed_url: "https://route360.dev/rss.en.xml",
      },
      {
        serialize: ({ query: { site, allMarkdownRemark } }) => {
          return allMarkdownRemark.nodes.map(node => {
            return Object.assign({}, node.frontmatter, {
              description: node.excerpt,
              date: node.frontmatter.date,
              url: `${site.siteMetadata.siteUrl}/fr/post/${node.fields.slug}/`,
              guid: `${site.siteMetadata.siteUrl}/fr/post/${node.fields.slug}/`,
            })
          })
        },
        query: `
          {
            allMarkdownRemark(
              filter: {
                frontmatter: { draft: { ne: true } }
                fields: { language: { eq: "fr" } }
              }
              sort: { frontmatter: { date: DESC } }
              limit: 10
            ) {
              nodes {
                excerpt
                frontmatter {
                  title
                  date
                }
                fields {
                  slug
                }
              }
            }
          }
        `,
        output: "/rss.fr.xml",
        title: "Route360",
        description: "Blog par une développeuse front-end",
        site_url: "https://route360.dev/fr/",
        feed_url: "https://route360.dev/rss.fr.xml",
      },
      {
        serialize: ({ query: { site, allMarkdownRemark } }) => {
          return allMarkdownRemark.nodes.map(node => {
            return Object.assign({}, node.frontmatter, {
              description: node.excerpt,
              date: node.frontmatter.date,
              url: `${site.siteMetadata.siteUrl}/ja/post/${node.fields.slug}/`,
              guid: `${site.siteMetadata.siteUrl}/ja/post/${node.fields.slug}/`,
            })
          })
        },
        query: `
          {
            allMarkdownRemark(
              filter: {
                frontmatter: { draft: { ne: true } }
                fields: { language: { eq: "ja" } }
              }
              sort: { frontmatter: { date: DESC } }
              limit: 10
            ) {
              nodes {
                excerpt
                frontmatter {
                  title
                  date
                }
                fields {
                  slug
                }
              }
            }
          }
        `,
        output: "/rss.ja.xml",
        title: "Route360",
        description: "フロントエンドの開発記録",
        site_url: "https://route360.dev/ja",
        feed_url: "https://route360.dev/rss.ja.xml",
      },
    ],
  },
},
```

## Créer un sitemap XML pour un site web multilingue

Le plugin officiel `gatsby-plugin-sitemap` de Gatsby peut générer un sitemap XML, mais il doit être optimisé pour les sites web multilingues.

La façon de générer un sitemap XML personnalisé avec le plugin est expliquée dans l'entrée suivante :

[Générer un plan de site XML pour un site Gatsby multilingue](/fr/post/gatsby-i18n-sitemap)

## Résumé

Avec une bonne utilisation de la création de chemins `gatsby-node.js`, j'ai pu créer un site multilingue avec Gatsby.js, sans utiliser de plugins spéciaux pour l'i18n.

Lorsque j'ai créé un site multilingue avec Astro, la documentation officielle d'Astro m'a beaucoup aidé à comprendre la structure. Le concept a fonctionné et a été appliqué à nouveau.

Il semble que les langues de droite à gauche (par exemple, l'arabe) soient également acceptables si le composant de mise en page est séparé par langue.

Voilà, c'est tout.
