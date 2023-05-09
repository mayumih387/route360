---
title: How to filter an array list using multiple checkboxes with React
tags:
  - react
date: 2022-11-15T02:00:00.448Z
lastmod: 2022-11-16T01:59:00.033Z
draft: false
---

This entry is about how to filter products or items (like in the E-commerce app) in React.

In this example, each product has tags used for filtering.

- [Demo](https://starlit-lollipop-635291.netlify.app/demo/filter-demo)
- [Code (GitHub)](https://github.com/mayumih387/demo-nextjs/blob/main/pages/demo/filter-demo.js)

The React hook I use this time is only `useState()`.

Working environment:

- Node.js v18.12.1
- React v18.2.0

## Make a base list of products/items

I prepared a base list of products like this;

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

Though the above example is hard-coded, in practical cases it should be rendered with [`map()`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/map) from an API or GraphQL.

This `const DATA` has `id` prop to provide `key` when all the items are rendered with `map()`.

## Make a filtered list from the base list

The base `const DATA` we made above is just a list. To make it filterable in the frontend, here we have a new filterable array list (in this case, I named it `const filteredDATA`).

As we filter the item list with tags, the new array list `const filteredDATA` must be built through selected tags.

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

If some tag is (or tags are) selected (`filterTags.length > 0`), the items which have that tag(s) are only returned. If no tag is selected, it returns the default `DATA` list.

The key of this code is `every()`; this returns only the items that have selected tag(s).

<span class="label warning">Reference</span> [Array.prototype.every() - JavaScript | MDN](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/every)

Then, we only return `const filteredDATA` in the frontend.

## Show filtered list in frontend

So, we made a filterable `const filteredDATA` from `const DATA`.

Now render and show `filteredDATA` with `return`.

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

We can't filter items yet as there aren't checkboxes.

So let's build checkboxes for filtering now.

## Make checkboxes for filtering

To filter items, render checkboxes inside `return`.

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

It's hard-coded because it's an example. In most practical cases, the list should be rendered with `map()`.

Each `input` checkbox has a common handler (I named it `filterHandler` function). The handler edits `filterTags` (= the checked-tags list) each time when users control checkboxes.

The handler is as follows;

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

If the user checks one of the checkboxes, the handler adds the tag into `filterTags`. Once it's unchecked, the handler removes the tag from `filterTags`.

## Conclusion

Here is the whole code;

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

Though I didn't add the sort function this time, it's also possible to add it; First, sort the `DATA` then make `filteredDATA`. I'll add another entry about it.
