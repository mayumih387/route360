---
title: Comment lancer une recherche après une conversion IME avec React Instantsearch
tags:
  - react
  - algolia
  - meilisearch
date: 2023-07-18
lastmod: 2024-08-15
draft: false
---

Cet article explique comment déclencher une recherche après une conversion IME comme le japonais ou le chinois avec [React Instantsearch](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/).

Par défaut, [React Instantsearch](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/) affiche toujours les résultats à chaque lettre tapée. Cependant, pour certaines langues asiatiques qui nécessitent des conversions, les résultats clignotent à chaque fois que vous tapez - ce qui rend l'expérience utilisateur inconfortable.

Je vais donc vous expliquer comment déclencher la recherche juste après la conversion.

Algolia publie de nombreux types de bibliothèques de recherche open source, mais chacune d'entre elles a ses propres composants et widgets, même si les noms sont les mêmes. Dans cet article, j'utilise React Instantsearch.

Bien que j'explique le code avec Algolia, il devrait fonctionner presque de la même manière avec Meilisearch.

Environnement :

- react-instantsearch v7.12.4
- algoliasearch v5.0.0
- React v18.3.1

## Aperçu

React Instantsearch a son propre widget `<SearchBox>` pour afficher un élément d'entrée à rechercher.

Cependant, pour détecter les états des compositions, nous avons besoin d'utiliser des événements `onCompositionStart` et `onCompositionEnd` dans les éléments `<input>`. Le widget `<SearchBox>` par défaut ne peut pas les accepter.

Ainsi, nous utilisons le hook `useSearchBox()` au lieu du widget `<SearchBox>` préparé.

- [\<Search Box> | Algolia](https://www.algolia.com/doc/api-reference/widgets/search-box/react/#hook)
- [compositionstart | MDN](https://developer.mozilla.org/fr/docs/Web/API/Element/compositionend_event)
- [compositionend | MDN](https://developer.mozilla.org/fr/docs/Web/API/Element/compositionend_event)

Pour détecter les états de composition, nous utilisons également `State` de React ; quand la composition commence, rendez-la `true`, et quand elle se termine, rendez-la `false`. Quand elle devient `false`, la requête est envoyée au moteur de recherche.

Pour mettre à jour la valeur de la requête, nous utilisons `refine()` du hook `useSearchBox()`.

## Fichiers de code

Je vais vous expliquer le code en 3 fichiers. C'est à vous de décider comment diviser ces composants.

```tree
src/
└─ components/
    ├─ search-box.js
    ├─ search-result.js
    └─ search.js // Composant parent
```

## Le Code

Voici les fichiers de code.

<div class="filename">src&#x2F;components&#x2F;search-box.js</div>

```js
import React, { useRef } from "react"
import { useSearchBox } from "react-instantsearch"

const SearchBox = ({
  onCompositionStart,
  onCompositionEnd,
  onChange,
  isComposing,
}) => {
  const { refine } = useSearchBox()
  const inputRef = useRef()

  const inputChangeHandler = event => {
    if (isComposing) return
    refine(event.target.value)
    onChange(event.target.value)
  }

  const conpositionEndHandler = () => {
    refine(inputRef.current?.value)
    onCompositionEnd(inputRef.current?.value)
  }

  return (
    <form onSubmit={event => event.preventDefault()}>
      <input
        type="text"
        placeholder="Enter keyword"
        aria-label="Search"
        onChange={inputChangeHandler}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={compositionEndHandler}
        ref={inputRef}
      />
    </form>
  )
}

export default SearchBox
```

<div class="filename">src&#x2F;components&#x2F;search-result.js</div>

```js
import React from "react"
import {
  Highlight,
  useHits,
  useInstantSearch,
} from "react-instantsearch"

const Hit = ({ hit }) => {
  return (
    <li>
      <a href={`/${hit.slug}/`}>
        <Highlight attribute="title" hit={hit} />
      </a>
    </li>
  )
}

const SearchResult = () => {
  const { hits } = useHits()
  const { status } = useInstantSearch()

  return (
    <div>
      {status === "loading" ? (
        <p>Recherche...</p>
      ) : status === "idle" && hits.length > 0 ? (
        <ul>
          {hits.map(hit => (
            <Hit key={hit.objectID} hit={hit} />
          ))}
        </ul>
      ) : (
        <p>Aucun résultat trouvé.</p>
      )}
    </div>
  )
}

export default SearchResult
```

<div class="filename">src&#x2F;components&#x2F;search.js</div>

```js
import React, { useState, useMemo } from "react"
import { algoliasearch } from "algoliasearch"
import { InstantSearch } from "react-instantsearch"
import SearchBox from "./search-box"
import SearchResult from "./search-result"

const Search = () => {
  const [query, setQuery] = useState()
  const [isComposing, setIsComposing] = useState(false)

  const searchClient = useMemo(
    () =>
      algoliasearch(
        process.env.YOUR_ALGOLIA_APP_ID,
        process.env.YOUR_ALGOLIA_SEARCH_KEY,
      ),
    [],
  )

  const inputChangeHandler = query => {
    setQuery(query)
  }

  const compositionStartHandler = () => {
    setIsComposing(true)
  }

  const compositionEndHandler = query => {
    setIsComposing(false)
    setQuery(query)
  }

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={process.env.YOUR_ALGOLIA_INDEX_NAME}
    >
      <SearchBox
        onChange={inputChangeHandler}
        onCompositionStart={compositionStartHandler}
        onCompositionEnd={compositionEndHandler}
        isComposing={isComposing}
        query={query}
      />
      {query?.length > 0 && <SearchResult />}
    </InstantSearch>
  )
}

export default Search
```

## Description du code

### Composant parent - search.js

À l'intérieur du composant parent, nous contrôlons les états de `query` et `isComposing` et mettons des gestionnaires pour les gérer, puis les envoyer à une composante enfant`search-box.js`.

```js
const [query, setQuery] = useState()
const [isComposing, setIsComposing] = useState(false)

// La saisie directe de caractères alphanumériques à demi-chasse définit immédiatement la requête
const inputChangeHandler = query => {
  setQuery(query)
}

// Démarrage de la composition
const compositionStartHandler = () => {
  setIsComposing(true)
}

// Pour l'entrée IME, définir la requête lorsque la conversion est terminée
const compositionEndHandler = query => {
  setIsComposing(false)
  setQuery(query)
}

return (
  //...
  <SearchBox
    onChange={inputChangeHandler}
    onCompositionStart={compositionStartHandler}
    onCompositionEnd={compositionEndHandler}
    isComposing={isComposing}
  />
  //...
)
```

### Composant enfant - search-box.js

Le composant de la boîte de recherche devrait maintenant avoir des événements `onCompositionStart` et `onCompositionEnd`. Envoyez la valeur d'entrée à la `compositionEndHandler` du parent quand `onCompositionEnd` tire, puis mettez à jour la `query` du parent.

```js
//...
const compositionEndHandler = () => {
  onCompositionEnd(inputRef.current?.value) // Mettre à jour les valeurs de requête lorsque la conversion est terminée
  refine(inputRef.current?.value)
}
```

La valeur de la requête est la même que la valeur entrée dans `<input>`, que nous gérons avec `useRef()`.

```js
//...
const inputRef = useRef()

//...
return (
  <form onSubmit={event => event.preventDefault()}>
    <input
      type="text"
      placeholder="Enter keyword"
      aria-label="Search"
      onChange={inputChangeHandler}
      onCompositionStart={onCompositionStart}
      onCompositionEnd={compositionEndHandler}
      ref={inputRef}
    />
  </form>
)
```

Nous voulons lancer une recherche immédiate lorsque des caractères de demi-ton (comme le français) sont entrés. Pour ce faire, l'événement `onChange` de `<input>` envoie la valeur saisie au parent en utilisant `inputChangeHandler` sauf lorsque l'état de `isComposing` est `true`.

```js
//...
const inputChangeHandler = event => {
  if (isComposing) return // Ne rien envoyer pendant la composition
  refine(event.target.value)
  onChange(event.target.value)
}
//...
```

C'est tout.
