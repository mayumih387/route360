---
title: Reactでアイテムを絞り込み（マルチフィルター）を行う方法
tags:
  - react
date: 2022-11-15T02:00:00.448Z
lastmod: 2022-11-16T01:59:09.562Z
draft: false
---

EC・ショッピングアプリなどで、グループや種類による複数条件での絞り込みをReactで行う方法です。

今回は例として、プロダクト毎にタグをつけ、タグで絞り込みが出来るようにします。

- [デモ](https://starlit-lollipop-635291.netlify.app/demo/filter-demo)
- [コード（GitHub）](https://github.com/mayumih387/demo-nextjs/blob/main/pages/demo/filter-demo.js)

今回利用するReact Hookは`useState()`となります。

動作環境：

- Node.js v18.12.1
- React v18.2.0

## 元となるリストを生成

今回は、以下のようなリストを作りました。

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

今回は上記のようにハードコーディングしていますが、通常の現場ではNext.jsやGatsby.js等により全てのアイテムを`map()`で展開するパターンとなると思います。

この`const DATA`は後ほど`return`内で`map()`展開するため、`key`指定のための`id`を設定しています。

## 絞り込みフィルターを通したリストを生成

用意した`const DATA`をそのまま表示しても絞り込みは出来ないため、フィルターを通した「整形可能な配列データ」に変換させます。

今回はタグを利用して絞り込みをするため、"ユーザーによって選択されたタグ"を含むアイテムのみ展開するようにします。

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

何かしらのタグが選択されている場合（= `filterTags.length > 0`）では、選択されているタグが含まれるアイテムのみをフィルタリング。タグが一切選択されていない時は、初期状態である`DATA`を返します。

ここでのポイントは、`every()`の利用です。選択されたタグを持っているアイテムのみをここで絞り込みます。

<span class="label warning">参考</span> [Array.prototype.every() - JavaScript | MDN](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/every)

ここで生成した`const filteredDATA`を、`return`内で表示させればいいわけですね。

## 絞り込みフィルターを通したリストを表示

ここまでで、`const DATA`を`const filteredDATA`として整形しなおしました。

この`filteredDATA`を、`return`内で展開・表示させます。

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

この時点ではまだ絞り込み用のチェックボックスはなく、絞り込みは出来ません。

次に絞り込み用のチェックボックスを作ります。

## 絞り込み用のタグのチェックボックスを作成

絞り込みを行うため、タグのチェックボックスを作ります。

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
    
ここでもハードコーディングしていますが、実際の現場ではやはりタグを`map()`で展開することになると思います。生成方法は適宜アレンジして下さい。

それぞれの`input`タグにおいて、チェックが入った時・外れた時に発火するハンドラー（ここでは`filterHandler`という関数名で作成）を設定します。ハンドラーは全て共通です。このハンドラーによって、`filterTags`（チェック済みタグのリスト）を逐次書き換えます。

ハンドラ自体は以下のようにしました。

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

ユーザーによってチェックされたら`filterTags`（チェック済みタグのリスト）に当該タグを追加。チェックが外れたら`filterTags`からそのタグを削除。至ってシンプルな内容です。

## コードまとめ

全てのコードをまとめると、以下の通りになります。

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

今回はソート（並び替え）を入れていませんが、`DATA`をソートして、そのソートしたデータを元に`filteredDATA`を生成すれば、ソート（並び替え）をしながら絞り込みをすることも可能です。いずれ解説したいと思います。
