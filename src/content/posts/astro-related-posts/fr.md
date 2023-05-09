---
title: Comment générer des articles connexes dans un blog Astro
tags:
  - astro
  - markdown
date: 2023-01-11T00:00:00.000Z
lastmod: 2023-01-11T00:00:00.000Z
draft: false
---

Voici une idée pour générer des articles connexes dans un blog Astro + Markdown.

Vous pouvez utiliser le code avec l'API de certains CMS si vous modifiez les parties de recherche/filtrage.

Environnement de fonctionnement :

- astro v1.9.1

## Structure du site web

Le blog Astro + Markdown pour cet exemple est le suivant ;

```text
src/
  ├ pages/
  │  └ [slug].astro
  ├ posts/
  │  ├ first-post.md
  │  ├ second-post.md 
  │  └ ...
  └ lib/
    └ getRelatedPosts.js
```

`[slug].astro` dans le répertoire `src` est le modèle de billet de blog. Le chemin d'accès à l'URL d'un article serait quelque chose comme `https://example.com/[slug]/`.

### Frontmatter YAML pour un billet Markdown

Frontmatter YAML pour cet exemple :

```md
---
title: Mon premier article
slug: first-post
categories: ['libre', 'anglais']
---
```

## Créez une fonction pour générer des articles connexes

Ensuite, créez `getRelatedPosts.js` dans le répertoire `lib` pour y placer une fonction personnalisée.

```text
src/
  └ lib/
    └ getRelatedPosts.js
```

De la manière la plus simple, obtenons "4 articles dans la même catégorie que le message actuel".

<div class="filename">/src/lib/getRelatedPosts.js</div>

```js
export function getRelatedPosts(allPosts, currentSlug, currentCats) {
  const relatedPosts = allPosts.filter(
    (post) =>
      post.frontmatter.slug !== currentSlug &&
      post.frontmatter.categories.includes(currentCats[0])
  )

  return relatedPosts.slice(0, 4) // Obtenir les 4 premiers articles avec slice()
}
```

1. Récupère tous les articles (`allPosts` - tableau), l'article actuel (avec `currentSlug`), et ses catégories (`currentCats` - tableau).
2. Filtre sur les article ayant la première catégorie de l'article actuelle (`currentCats` - array) sauf l'article actuel (`currentSlug`) de tous les articles (`allPosts` - array).
3. Obtenir les quatre premiers articles en tant que `relatedPosts`.

Il serait possible de filtrer jusqu'aux articles "contenant le même tag" "l'ordre du nombre de mêmes tags", etc. si vous êtes très motivé pour aller plus loin.🙂

### Add a random select function

Si vous souhaitez générer des articles connexes sélectionnés de manière aléatoire, ajoutez une fonction aléatoire lors du renvoi des articles connexes.

<div class="filename">/src/lib/getRelatedPosts.js</div>

```js
export function getRelatedPosts(allPosts, currentSlug, currentCats) {
  // fonction de sélection aléatoire
  const randomLot = (array, num) => {
    let newArray = []

    while (newArray.length < num && array.length > 0) {
      const randomIndex = Math.floor(Math.random() * array.length)
      newArray.push(array[randomIndex])
      array.splice(randomIndex, 1)
    }

    return newArray
  }

  const relatedPosts = allPosts.filter(
    (post) =>
      post.frontmatter.slug !== currentSlug &&
      post.frontmatter.categories.includes(currentCats[0])
  )

  return randomLot(relatedPosts, 4) // sélection aléatoire
  // return relatedPosts.slice(0, 4)
}
```

## Afficher les articles connexes dans le modèle d'article

Ensuite, `[slug].astro` serait comme suit ;

<div class="filename">/src/pages/[slug].astro</div>

```js
---
import { getRelatedPosts } from "../lib/getRelatedPosts"

export async function getStaticPaths() {
  // Obtenir tous les postes
  const allPosts = await Astro.glob("../posts/*.md")
  // Obtenir le nombre de postes
  const numberOfPosts = allPosts.length

  return allPosts.map((post) => ({
    params: {
      slug: post.frontmatter.slug,
    },
    props: {
      post,
      // Passer le props des articles connexes
      relatedPosts: getRelatedPosts(
        allPosts,
        post.frontmatter.slug,
        post.frontmatter.categories
      ),
    },
  }))
}

// Obtenir les articles connexes
const { relatedPosts } = Astro.props
---

// Afficher les articles connexes ici
{relatedPosts.length > 0 && (
  relatedPosts.map((post) => (
    <li><a href={`/${post.frontmatter.slug}/`}>{post.frontmatter.title}</a></li>
  ))
)}
```

En cas général, vous devez éliminer les brouillons d'articles, ou créer un composant pour les articles connexes. Faites-le comme vous le souhaitez.

Voilà, c'est fait !