---
title: How to Trigger Search After IME Conversion with React Instantsearch Hooks
tags:
  - react
  - algolia
  - meilisearch
date: 2023-07-18
lastmod: 2023-07-18
draft: false
---

This entry is about how to trigger search after IME conversion such as Japanese or Chinese with [React Instantsearch Hooks](https://www.algolia.com/doc/api-reference/widgets/instantsearch/react-hooks/).

By default, [React Instantsearch Hooks](https://www.algolia.com/doc/api-reference/widgets/instantsearch/react-hooks/) always shows the results on every letter you type. However, for some Asian languages that need conversions, the results flash every time while typing - which makes the user experience uncomfortable.

So I'll explain how to trigger the search right after the conversion.

Algolia provides many types of open source search libraries, but each of them has its own components and widgets, even though the names are the same. In this entry, I use [React Instantsearch Hooks](https://www.algolia.com/doc/api-reference/widgets/instantsearch/react-hooks/).

Although I explain the code with Algolia, it should work almost the same with Meilisearch.

Environment:

- react-instantsearch-hooks v6.46.0
- algoliasearch v4.18.0
- React v18.2.0

## Overview

React Instantsearch Hooks has own `<SearchBox>` widget to show an input element to search.

However, to detect the composition states, we need to use `onCompositionStart` and `onCompositionEnd` events inside `<input>` element. The default `<SearchBox>` widget can't accept them.

So, we use the `useSearchBox()` hook instead of the prepared `<SearchBox>` widget.

- [\<Search Box> | Algolia](https://www.algolia.com/doc/api-reference/widgets/search-box/react-hooks/#hook)
- [Element: compositionstart event | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionstart_event)
- [Element: compositionend event | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionend_event)

To detect the composition states, we also use React's `State`; when the composition starts, make it `true`, and when it ends, make it `false`. When it becomes `false`, the query is sent to the search engine.

To update the query value, we use `refine()` from the `useSearchBox()` hook.

## Code files

I'll explain the code for 3 files. It's completely up to you how to split these components.

```tree
src/
└─ components/
    ├─ search-box.js
    ├─ search-result.js
    └─ search.js // Parent component
```

## The Code

Here are the code files.

<div class="filename">src&#x2F;components&#x2F;search-box.js</div>

```js
import React, { useRef } from "react"
import { useSearchBox } from "react-instantsearch-hooks-web"

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
} from "react-instantsearch-hooks-web"

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
        <p>Searching...</p>
      ) : status === "idle" && hits.length > 0 ? (
        <ul>
          {hits.map(hit => (
            <Hit key={hit.objectID} hit={hit} />
          ))}
        </ul>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  )
}

export default SearchResult
```

<div class="filename">src&#x2F;components&#x2F;search.js</div>

```js
import React, { useState, useMemo } from "react"
import algoliasearch from "algoliasearch/lite"
import { InstantSearch } from "react-instantsearch-hooks-web"
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

## Code Description

### Parent component - search.js

Inside the parent component, we control the states of `query` and `isComposing` and put handlers to manage them, then send them to a child component `search-box.js`.

```js
const [query, setQuery] = useState()
const [isComposing, setIsComposing] = useState(false)

// Direct input of half-width alphanumeric characters immediately sets the query
const inputChangeHandler = query => {
  setQuery(query)
}

// Composition starts
const compositionStartHandler = () => {
  setIsComposing(true)
}

// For IME input, set query when conversion is done
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

### Child component - search-box.js

The search box component should now have `onCompositionStart` and `onCompositionEnd` events. Send the input value to the parent's `compositionEndHandler` when `onCompositionEnd` fires, then update the parent's `query`.

```js
//...
const compositionEndHandler = () => {
  onCompositionEnd(inputRef.current?.value) // Update query values when conversion is done
  refine(inputRef.current?.value)
}
```

The query value is the same as the value entered in `<input>`, which we manage with `useRef()`.

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

We want to run immediate search when half-pitch charactor (such as English) is entered. To do so, `onChange` event of the `<input>` sends the entered value to parent by using `inputChangeHandler` except when `isComposing` state is `true`.

```js
//...
const inputChangeHandler = event => {
  if (isComposing) return // Send nothing while composing
  refine(event.target.value)
  onChange(event.target.value)
}
//...
```

That's it.
