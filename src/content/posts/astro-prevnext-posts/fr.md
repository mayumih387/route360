---
title: Afficher les articles précédent/suivant sur une page de blog Astro
tags:
  - astro
  - markdown
date: 2023-01-23T15:00:00.000Z
lastmod: 2023-02-15T05:58:20.861Z
draft: false
---

Cet article explique comment afficher les articles précédent/suivant sur une page de blog Astro + Markdown.

Il peut être adapté pour certains CMS sans tête et leur API, je pense.

Les étapes sont les suivantes ;

1. Trier tous les articles par la date de leur publication
2. Obtenir le nombre d'index de l'article actuel à partir de 1
3. Obtenir le nombre d'index du message précédent/suivant à partir de 1.
4. Même si le message suivant ou précédent n'existe pas, créez un enregistrement vide.
5. Afficher les billets précédent/suivant s'ils existent.

Environnement

- Astro v2.0.11

## Structure du projet

Dans cet article, je développe un blog Astro + Markdown avec la structure suivante.

`[slug].astro` sous `src` est le modèle de billet, et l'URL du billet serait quelque chose comme `https://example.com/[slug]/`.

```text
src/
  ├ components/
  │  └ prevNext.astro
  ├ pages/
  │  └ [slug].astro
  ├ posts/
  │  ├ first-post.md
  │  ├ second-post.md 
  │  └ ...
  └ utils/
    └ sortByDate.js
```

- `/components/prevNext.astro` Composant des billets précédent/suivant
- `/pages/[slug].astro` Modèle de billet unique
- `/utiles/sortByDate.js` fonction pour trier les billets par date

### Frontmatter YAML d'un post Markdown

Le frontmatter YAML d'un post est défini comme suit ;

```md
---
title: C'est mon premier post
slug: first-post
date: 2023-01-01
---
```

## Créer d'une fonction pour trier les billets par date

Tout d'abord, préparez une fonction pour trier les billets par date. Vous connaissez peut-être déjà cette fonction grâce à Next.js ou autre.

<div class="filename">/src/utils/sortByDate.js</div>

```js
export const sortByDate = (a, b) => {
  return new Date(b.frontmatter.date) - new Date(a.frontmatter.date)
}
```

Comme cet exemple concerne les posts Markdown, j'attribue `frontmatter.date` à l'argument `new Date()`. Si vous utilisez une API ou GraphQL, attribuez la valeur appropriée.

## Générer les articles précédent/suivant dans le modèle d'article

À l'intérieur de `[slug].astro`, le modèle de billet, vous générez les billets précédent/suivant en même temps que le billet actuel.

Comme il s'agit d'un exemple pour un blog Markdown, je passe `frontmatter` comme propriétés des posts précédent/suivant. Si l'un ou l'autre n'existe pas, passez un frontmatter vide. Dans le cas d'une API, passez `slug` ou une autre valeur à la place.

<div class="filename">/src/pages/[slug].astro</div>

```js
---
import { sortByDate } from "./utils/sortByDate.js"

export async function getStaticPaths() {
  const allPosts = await Astro.glob("../posts/*.md")
  const numberOfPosts = allPosts.length // Nombre de tous les postes

  return allPosts.sort(sortByDate).map((post, i) => ({ // Map() all posts after sorting
    params: {
      slug: post.frontmatter.slug,
    },
    props: {
      post,
      prevPost: // Previous post
        i + 1 === numberOfPosts // If the current post is the oldest
          ? { frontmatter: ""}
          : allPosts[i + 1],
      nextPost: // Next post
        i === 0 // If the current post is the newest
          ? { frontmatter: "" }
          : allPosts[i - 1],
    },
  }))
}

// Get properties (frontmatter) for the previous/next posts
const { prevPost, nextPost } = Astro.props
---
```

Une fois que vous avez récupéré les props précédent/suivant dans `Astro.props`, affichez-les dans le même modèle.

<div class="filename">/src/pages/[slug].astro</div>

```js
---
// ...
const { prevPost, nextPost } = Astro.props
---

// Poste précédent (s'il existe)
{prevPost.frontmatter && <a href={`/${prevPost.frontmatter.slug}/`}>{prevPost.frontmatter.title}</a>}

// Poste suivant (s'il existe)
{nextPost.frontmatter && <a href={`/${nextPost.frontmatter.slug}/`}>{nextPost.frontmatter.title}</a>}
```

## Utiliser un composant personnalisé pour les messages précédents/suivants

Dans la plupart des cas, vous voudrez utiliser un composant personnalisé pour les billets précédent/suivant.

Pour ce faire, créez d'abord un composant nommé `prevNext.astro` dans le répertoire `component`.

<div class="filename">/src/components/prevNext.astro</div>

```js
---
const { prevPost, nextPost } = Astro.props
---

// Poste précédent (s'il existe)
{prevPost.frontmatter && <a href={`/${prevPost.frontmatter.slug}/`}>{prevPost.frontmatter.title}</a>}

// Poste suivant (s'il existe)
{nextPost.frontmatter && <a href={`/${nextPost.frontmatter.slug}/`}>{nextPost.frontmatter.title}</a>}
```

Importez ensuite ce composant dans le modèle de billet `[slug].astro` et passez-lui les propriétés précédent/suivant.

<div class="filename">/src/pages/[slug].astro</div>

```js
---
import PrevNext from "components/PrevNext.astro" // Importer le composant

// ...

const { prevPost, nextPost } = Astro.props
---

// Transférer les propriétés
<PrevNext {prevPost} {nextPost} />
```

C'est fait !