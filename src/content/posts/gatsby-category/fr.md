---
title: Comment ajouter les categories sur Gatsby.js + Markdown blog
tags:
  - jamstack
  - markdown
  - gatsbyjs
date: 2023-01-07T15:00:00.000Z
lastmod: 2023-02-23T06:55:50.544Z
draft: false
---

Bien que ce soit beaucoup plus facile si vous utilisez un CMS sans tête, il est un peu compliqué de gérer les catégories ou les étiquettes (ou les tags) dans un blog Markdown.

De plus, si la langue du blog n'est pas l'anglais, vous voudrez peut-être définir un titre de catégorie ou une description dans votre langue, mais son slug en anglais pour le SEO. Cela rend la chose plus compliquée.

J'aimerais proposer ici une idée sur la gestion des catégories dans un blog Gatsby.js Markdown. Cela peut être aussi compatible pour les étiquettes.

Environnement de fonctionnement :

- Node.js v18.12.1
- React v18.2.0
- Gatsby.js v5.6.0
- gatsby-transformer-json v5.6.0

## Préparer un fichier json pour les catégories

Dans ce cas, nous allons gérer les catégories dans un fichier json. Créez le fichier `category.json` dans le répertoire `/src/data/`.

*Un fichier .js est également acceptable. Dans ce cas, gatsby-transformer-json n'est pas nécessaire.

<div class="filename">/src/data/category.json</div>

```js
[
  {
    "title": "Comédie",
    "slug": "comedy",
    "description": "Articles sur les films de comedie."
  },
  {
    "title": "Horreur",
    "slug": "horror",
    "description": "Articles sur les films d'horreur. Mais je n'aime pas l'horreur en effet."
  },
  {
    "title": "Fantaisie",
    "slug": "fantasy",
    "description": "Articles sur les films fantastiques. Harry Potter est le meilleur de tous les temps."
  }
]
```

Voici un exemple de catégories. Bien sûr, vous pouvez ajouter d'autres propriétés si vous en avez besoin.

Dans le cas des étiquettes, vous pouvez créer `tag.json` dans le même répertoire comme ceci.

## Données sur les catégories dans les fichiers Markdown

À l'intérieur des fichiers Markdown, les métadonnées telles que le titre ou les catégories doivent être gérées avec YAML Frontmatter. Pour ajouter des catégories, utilisez les slugs que vous avez créées dans `category. json`.

<div class="filename">/content/posts/funny-10-movies.md</div>

```md
---
title: Les 10 meilleurs films drôles de l'année!
slug: funniest-10-movies
category:
  - comedy
date: 2022-10-11
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
```

Dans l'exemple ci-dessus, j'ai ajouté "comedy" comme catégorie. Cela peut être 2 ou plus.

## Installer gatsby-transformer-json

Ensuite, pour récupérer les données de la catégorie avec GraphQL installer [gatsby-transformer-json](https://www.gatsbyjs.com/plugins/gatsby-transformer-json/), Un plugin officiel de Gatsby. js

```bash
# pour npm
npm install gatsby-transformer-json

# pour yarn
yarn add gatsby-transformer-json
```

Au même temps, éditer `gatsby-config.js` pour ajouter gatsby-transformer-json et le répertoire de fichiers json (`/src/data/`) par `gatsby-source-filesystem`.

<div class="filename">/gatsby-config.json</div>

```js
module.exports = {
　//...

  plugins: [
    //...
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data/`,
      },
    },
  ]
}
```

Cela permet d'obtenir `CategoryJson` comme nouveau schéma.

## Lier la catégorie slug entre Frontmatter et CategoryJson

La catégorie (ou les catégories) à l'intérieur du Frontmatter et celles dans "CategoryJson" ne sont pas encore liées, mais c'est possible car elles partagent les mêmes lettres que "slug" de "CategoryJson".

Afin de lier `slug` de `CategoryJson` à la catégorie Frontmatter, ajoutez le code suivant à `gatsby-node.js`.

<div class="filename">/gatsby-node.js</div>

```js
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
  type MarkdownRemark implements Node {
    frontmatter: Frontmatter
  }
  type Frontmatter implements Node {
    category: [CategoryJson] @link(by: "slug")
  }
  `
  createTypes(typeDefs)
}
```

Cela permet d'obtenir le title de categorie ou la déscription du

Cela permet d'obtenir le titre ou la description de la catégorie à partir du node de `markdownRemark`.

`createSchemaCustomization` lui-même est une API pour établir des relations entre deux nodes différents.

<span class="label warning">Référence</span> [Create foreign key relationships between data - Creating a Source Plugin | Gatsby](https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/creating-a-source-plugin/#create-foreign-key-relationships-between-data)

Le GraphQL peut maintenant interroger `markdownRemark` comme suit ;

<div class="filename">Avant: GraphQL</div>

```graphql
query MyQuery {
  markdownRemark {
    frontmatter {
      category
    }
  }
}
```

<div class="filename">Après: GraphQL</div>

```graphql
query MyQuery {
  markdownRemark {
    frontmatter {
      category {
        id
        title
        slug
      }
    }
  }
}
```

## Générer des chemins d'accès de page de catégorie

Nous créons maintenant des chemins de page de catégorie (URL) avec `gatsby-node.js`.

La clé est de ne pas utiliser `categoryJson` pour obtenir la requête de la catégorie.

Pourqoui ? Parce que nous ne savons jamais si toutes les catégories à l'intérieur de `category. json` sont réellement utilisées dans les fichiers Markdown. Nous devons éviter de générer des chemins pour les catégories jamais utilisées.

Par conséquent, nous utilisons une valeur de groupe de `allMarkdownRemark` pour sélectionner les catégories à partir des fichiers Markdown. C'est une fonctionnalité géniale de Gatsby crois.😺

<span class="label warning">Référence</span> [Group - GraphQL Query Options | Gatsby](https://www.gatsbyjs.com/docs/graphql-reference/#group)

Étant donné que cette valeur de groupe filtre les seuls éléments de catégorie existants, il n'y a aucun souci concernant les chemins vers les catégories non utilisées à générer.

Dans ce contexte, ajoutez d'abord une requête ;

<div class="filename">/gatsby-node.js</div>

```js
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const blogresult = await graphql(`
    query {
      allMarkdownRemark{
        group(field: { frontmatter: { category: SELECT } }) {
          fieldValue
          totalCount
        }
        ...other nodes...
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`)
    return
  }

  // à suivre au code suivant
}
```

Ensuite, générez les chemins d'accès aux pages de catégories avec `createPage`.

À ce stade, passez le slug de la catégorie comme contexte au modèle afin qu'il puisse être utilisé pour filtrer et pointer la catégorie à afficher.

<div class="filename">/gatsby-node.js</div>

```js
  // suite précédente

  const catPostPerPage = 10 // le nombre d'articles par page
  blogresult.data.allMarkdownRemark.group.forEach((node) => {
    const catPosts = node.totalCount
    const catPages = Math.ceil(catPosts / catPostPerPage)
    Array.from({ length: catPages }).forEach((_, i) => {
      createPage({
        path:
          i === 0
            ? `/category/${node.fieldValue}` // le premier page
            : `/category/${node.fieldValue}/page/${i + 1}`, // 2ème ou la page suivante
        component: path.resolve(`./src/templates/cat-template.js`), // le modèle à utiliser
        context: {
          cat_slug: node.fieldValue, // passer le slug de la catégorie au modèle
          skip: catPostPerPage * i,
          limit: catPostPerPage,
        },
      })
    })
  })
```

Donc, `gatsby-node.js` est maintenant bien fait. Pour un moment, ouvrez la page 404 sur un navigateur et regardez les pages qui ont été générées. Vous verrez les chemins des pages de catégories.

## Éditer le modèle de la catégorie

À l'intérieur du modèle de la catégorie, on utilise deux types de node de GraphQL.

- `categoryJson` comme les données des categories -> le title ou la description de la catégorie
- `allMarkdownRemark` comme les articles dans le catégorie

Nous avons créé `cat_slug` comme un contexte lors de la génération des pages de catégories dans `gatsby-node.js`. Par ce `cat_slug`, à l'intérieur du modèle, la catégorie ou les articles peuvent être filtrés.

Example à obtenir les nodes :

<div class="filename">/src/templates/cat-template.js</div>

```js
export const query = graphql`
  query ($cat_slug: String!, $skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      filter: {
        frontmatter: {
          category: { elemMatch: { slug: { eq: $cat_slug } } }
        }
      }
    ) {
      nodes {
        id
        html
        frontmatter {
          title
          slug
        }
      }
    }
    categoryJson(slug: { eq: $cat_slug }) {
      title
      slug
      description
    }
  }
`
```

C'est tout ! Maintenant, juste afficher le titre de la catégorie ou quoi que ce soit dans le modèle.👌