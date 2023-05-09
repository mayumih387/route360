---
title: Comment filtrer une liste d'array par des cases à cocher dans React
tags:
  - react
date: 2022-11-15T02:00:00.448Z
lastmod: 2022-11-16T01:59:05.523Z
draft: false
---

C'est comment filtrer une liste d'array in React, comme dans l'application e-commerce.

Dans cet example, je fais chaque produit avoir des tags qui peuvent être utiliser pour filtration.

- [Demo](https://starlit-lollipop-635291.netlify.app/demo/filter-demo)
- [Code (GitHub)](https://github.com/mayumih387/demo-nextjs/blob/main/pages/demo/filter-demo.js)

On utilise `useState()`comme React Hook cette fois.

Environnement de fonctionnement :

- Node.js v18.12.1
- React v18.2.0

## Faire une liste de produits

J'ai préparé un example comme suivant;

```js
const DATA = [
  {
    id: 1,
    title: 'Enjoy studying English',
    tags: [
      {
        id: 'tag1',
        title: 'English',
        slug: 'english',
      },
      {
        id: 'tag2',
        title: 'For kids',
        slug: 'kids',
      },
    ],
  },
  {
    id: 2,
    title: 'Parlons français',
    tags: [
      {
        id: 'tag3',
        title: 'French',
        slug: 'french',
      },
      { id: 'tag2', title: 'Kids', slug: 'kids' },
    ],
  },
  {
    id: 3,
    title: 'Intermediate English',
    tags: [
      {
        id: 'tag1',
        title: 'English',
        slug: 'english',
      },
      {
        id: 'tag4',
        title: 'Adults',
        slug: 'adults',
      },
    ],
  },
  {
    id: 4,
    title: 'How to study French',
    tags: [
      {
        id: 'tag3',
        title: 'French',
        slug: 'french',
      },
      {
        id: 'tag4',
        title: 'Adults',
        slug: 'adults',
      },
    ],
  },
]
```

C'est codé en dur, mais dans les cas pratiques on plutôt rend un tableau par `map()` en utilisant Next.js ou Gatsby.js.

Puisque on va rendre ce `const DATA` avec `map()` dans `return`, je signifie `id` pour `key`.

## Modifier la liste comme une liste filtrée

Parce que `const DATA`-même n'est pas encore très filtrable, on le modifie une autre liste d'array.

Pour filtrer par tags, on ne rend que les produits qui ont "les tags que l'utilisateur choisit".

```js
  const [filterTags, setFilterTags] = useState([])

  const filteredDATA = DATA.filter((node) =>
    filterTags.length > 0
      ? filterTags.every((filterTag) =>
          node.tags.map((tag) => tag.slug).includes(filterTag)
        )
      : DATA
  )
```

Au cas où quelque tag est choisi (= `filterTags.length > 0`), `const filteredDATA` renvoie les produits qui ont ce tag-ci. Au cas où aucun tag n'est choisi, il renvoie la liste `DATA` originale.

Le clé sur ce point est `every()`. Ici on filtre les produits qui ont les tags choisis.

<span class="label warning">Référence</span> [Array.prototype.every() - JavaScript | MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/every)

Alors maintenant on rend `const filteredDATA` à l'intérieur de `return`.

## Montrer la liste avec return

On a modifié `const DATA` comme filtrable `const filteredDATA`.

Maintenant, on va rendre et montrer `filteredDATA` à l'intérieur de `return`.

```js
return(
  <>
    <ul>
      {filteredDATA.map((node) => (
        <li key={node.id}>{node.title}</li>
      ))}
    </ul>
  <>
)
```

Puisqu'il n'y a pas encore de case à cocher, on ne peut pas filtrer les produits.

## Faire les cases à cocher pour filtration

Alors on va faire les cases à cocher en suite pour filtration.

```js
return (
  <>
    <div>
      <label htmlFor="english">
        <input
          type="checkbox"
          onChange={filterHandler}
          value="english"
          id="english"
        />
          <span>English</span>
        </label>
        <label htmlFor="french">
          <input
            type="checkbox"
            onChange={filterHandler}
            value="french"
            id="french"
          />
          <span>French</span>
        </label>
        <label htmlFor="kids">
          <input
            type="checkbox"
            onChange={filterHandler}
            value="kids"
            id="kids"
          />
          <span>Kids</span>
        </label>
        <label htmlFor="adults">
          <input
            type="checkbox"
            onChange={filterHandler}
            value="adults"
            id="adults"
          />
          <span>Adults</span>
        </label>
      </div>
      
      <div>
        <ul>
         {/* ... */}
        </ul>
      </div>
    </>
  )
```
    
J'ai codé en dur ici, mais dans la plupart des cas pratiques on rend les tag avec `map()` je crois.

Chaque `input` case à cocher a un gestionnaire commun (je l'ai nommé `filterHandler`.) Ce gestionnaire édite `filterTags` (= la liste de tags choisis) chaque fois que les utilisateur contrôlent les cases à cocher.

J'ai fait le gestionnaire comme suivant;

```js
const filterHandler = (event) => {
  if (event.target.checked) {
    setFilterTags([...filterTags, event.target.value])
  } else {
    setFilterTags(
      filterTags.filter((filterTag) => filterTag !== event.target.value)
    )
  }
}
```

Quand un utilisateur coche un case d'un tag, ce gestionnaire ajoute le tag à `filterTags`. Une fois décoché, il enlève ce tag de `filterTags`.

## Conclusion

Voilà le code complet;

```js
import { useState } from 'react'

export default function Filter() {
  const DATA = [
    {
      id: 1,
      title: 'Enjoy studying English',
      tags: [
        {
          id: 'tag1',
          title: 'English',
          slug: 'english',
        },
        {
          id: 'tag2',
          title: 'For kids',
          slug: 'kids',
        },
      ],
    },
    {
      id: 2,
      title: 'Parlons français',
      tags: [
        {
          id: 'tag3',
          title: 'French',
          slug: 'french',
        },
        { id: 'tag2', title: 'Kids', slug: 'kids' },
      ],
    },
    {
      id: 3,
      title: 'Intermediate English',
      tags: [
        {
          id: 'tag1',
          title: 'English',
          slug: 'english',
        },
        {
          id: 'tag4',
          title: 'Adults',
          slug: 'adults',
        },
      ],
    },
    {
      id: 4,
      title: 'How to study French',
      tags: [
        {
          id: 'tag3',
          title: 'French',
          slug: 'french',
        },
        {
          id: 'tag4',
          title: 'Adults',
          slug: 'adults',
        },
      ],
    },
  ]

  const [filterTags, setFilterTags] = useState([])

  const filteredDATA = DATA.filter((node) =>
    filterTags.length > 0
      ? filterTags.every((filterTag) =>
          node.tags.map((tag) => tag.slug).includes(filterTag)
        )
      : DATA
  )

  const filterHandler = (event) => {
    if (event.target.checked) {
      setFilterTags([...filterTags, event.target.value])
    } else {
      setFilterTags(
        filterTags.filter((filterTag) => filterTag !== event.target.value)
      )
    }
  }

  return (
    <>
      <div>
        <label htmlFor="english">
          <input
            type="checkbox"
            onChange={filterHandler}
            value="english"
            id="english"
          />
          <span>English</span>
        </label>
        <label htmlFor="french">
          <input
            type="checkbox"
            onChange={filterHandler}
            value="french"
            id="french"
          />
          <span>French</span>
        </label>
        <label htmlFor="kids">
          <input
            type="checkbox"
            onChange={filterHandler}
            value="kids"
            id="kids"
          />
          <span>Kids</span>
        </label>
        <label htmlFor="adults">
          <input
            type="checkbox"
            onChange={filterHandler}
            value="adults"
            id="adults"
          />
          <span>Adults</span>
        </label>
      </div>
      <ul>
        {filteredDATA.map((node) => (
          <li key={node.id}>{node.title}</li>
        ))}
      </ul>
    </>
  )
}
```

Je n'ai pas mis de fonction de trier cette fois, mais il est aussi possible trier et filtrer au même temps; D'abord trier `DATA`, puis modifier-le comme `filteredDATA`. Je pense à créer un autre article pour cela.
