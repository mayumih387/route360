---
title: React Instantsearch Hooksの即時検索で、日本語の変換後に検索を実行させる方法
tags:
  - react
  - algolia
  - meilisearch
date: 2023-07-18
lastmod: 2023-07-18
draft: false
---

AlgoliaやMeilisearchで使える[React Instantsearch Hooks](https://www.algolia.com/doc/api-reference/widgets/instantsearch/react-hooks/)で、日本語などの文字変換中は検索を実行させずに、変換確定後に検索を実行させる方法です。

React Instantsearch Hooksなどでは、デフォルトでは入力した内容が即時に検索結果に反映されます。しかし変換が必要な日本語等の言語の場合、変換前の入力中にも検索が実行されてしまうと、意に反した検索結果の表示が代わる代わる出てしまい、ユーザー体験を損ないます。

そのため、今回は変換確定後にのみ検索を実行させたいと思います。

Algoliaではさまざまなオープンソースの検索用ライブラリを提供していますが、それぞれでウィジェットやコンポーネントが異なります。今回の説明は「[React Instantsearch Hooks](https://www.algolia.com/doc/api-reference/widgets/instantsearch/react-hooks/)」用ですので、ご注意ください。

また、今回はAlgoliaを例にして作っていますが、Meilisearchでもほぼ同じように作れるはずです。

動作環境：

- react-instantsearch-hooks v6.46.0
- algoliasearch v4.18.0
- React v18.2.0

## 変換入力中に検索させない方法の概要

React Instantsearch Hooksには、標準で`<SearchBox>`という検索入力窓のウィジェットが用意されています。

しかし、IMEでの変換中・変換終了を検知させるためには、`<input>`タグに直接`onCompositionStart`と`onCompositionEnd`というイベントを使う必要があります。標準の`<SearchBox>`ウィジェットのままではそれができません。

そのため、標準の`<SearchBox>`ウィジェットを使わず、`useSearchBox()`フックを用いて検索窓を自作します。

- [\<Search Box> | Algolia](https://www.algolia.com/doc/api-reference/widgets/search-box/react-hooks/#hook)
- [Element: compositionstart イベント | MDN](https://developer.mozilla.org/ja/docs/Web/API/Element/compositionstart_event)
- [Element: compositionend イベント | MDN](https://developer.mozilla.org/ja/docs/Web/API/Element/compositionend_event)

検索中を検知させるためにReactの`State`を使い、変換入力が始まったら「変換中=`true`」、変換が終わったら「変換中=`false`」とし、falseになったらクエリを検索エンジンに送るようにします。

クエリ値の更新には、検索窓コンポーネント内で`useSearchBox()`フックから呼び出した`refine()`を使います。

## コードのファイル構造

今回説明するファイルは、以下の3つです。コンポーネントの分割は好みで行ってください。

```tree
src/
└─ components/
    ├─ search-box.js
    ├─ search-result.js
    └─ search.js // 親コンポーネント
```

## コード

というわけで、以下がコード例です。

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
        placeholder="検索ワードを入力してください"
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
        <p>検索中...</p>
      ) : status === "idle" && hits.length > 0 ? (
        <ul>
          {hits.map(hit => (
            <Hit key={hit.objectID} hit={hit} />
          ))}
        </ul>
      ) : (
        <p>キーワードに合う結果はありませんでした。</p>
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

## コードの解説

### 親コンポーネント search.js

親コンポーネント内では、「クエリ`query`」および「変換中`isComposing`」の状態と、それらの状態を管理するハンドラーを置き、`search-box.js`に送ります。

```js
const [query, setQuery] = useState()
const [isComposing, setIsComposing] = useState(false)

// 半角英数直接入力では即時にクエリをセット
const inputChangeHandler = query => {
  setQuery(query)
}

// 変換スタート
const compositionStartHandler = () => {
  setIsComposing(true)
}

// 日本語入力の場合、変換終了したらクエリをセット
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

### 子コンポーネント search-box.js

検索窓を表示させる子コンポーネントでのポイントは、`onCompositionStart`と`onCompositionEnd`の使い方です。`onCompositionEnd`のタイミングで、親コンポーネントの`compositionEndHandler`に入力値を送り、クエリ値`query`を更新させます。

```js
//...
const compositionEndHandler = () => {
  onCompositionEnd(inputRef.current?.value) // 変換が終わったらクエリ値を更新
  refine(inputRef.current?.value)
}
```

クエリ値は`<input>`に入力した値となりますが、これは`useRef()`で管理します。

```js
//...
const inputRef = useRef()

//...
return (
  <form onSubmit={event => event.preventDefault()}>
    <input
      type="text"
      placeholder="検索ワードを入力してください"
      aria-label="Search"
      onChange={inputChangeHandler}
      onCompositionStart={onCompositionStart}
      onCompositionEnd={compositionEndHandler}
      ref={inputRef}
    />
  </form>
)
```

また、全角ではなく半角英数で入力された場合には即時検索を実行させたいため、`<input>`の`onChange`イベントを使って、`inputChangeHandler`により即時にクエリ値を送ります。ただし、`isComposing`状態が`true`の間（変換中）はクエリは`inputChangeHandler`は何もしません。

```js
//...
const inputChangeHandler = event => {
  if (isComposing) return // 変換中は何もしない
  refine(event.target.value)
  onChange(event.target.value)
}
//...
```

以上です。
