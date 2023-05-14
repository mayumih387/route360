---
title: How to generate related posts in an Astro blog
tags:
  - astro
  - markdown
date: 2023-01-11T00:00:00.000Z
lastmod: 2023-01-12T15:07:01.152Z
draft: false
---

Here is one idea about generating related posts in Astro + Markdown static blog.

You may be able to use the code with API from some CMS if you change fetching/filtering parts.

Working environment:

- astro v1.9.1

## Website structure

Astro + Markdown blog for this example is as follows;

```tree
src/
├─ pages/
│    └─ [slug].astro
├─ posts/
│    ├─ first-post.md
│    ├─ second-post.md
│    └─ ...
├─ lib/
│    └─ getRelatedPosts.js
```

`[slug].astro` under the `pages` directory is the blog post template. The URL path for a post would be something like `https://example.com/[slug]/`.

### YAML frontmatter for a Markdown post

YAML frontmatter for this example:

```md
---
title: My First Post
slug: first-post
categories: ["book", "english"]
---
```

## Create a function to generate related posts

Then, create `getRelatedPosts.js` under the `lib` directory to put a custom function.

```tree
src/
├─ pages/
│    └─ [slug].astro
├─ posts/
│    ├─ first-post.md
│    ├─ second-post.md
│    └─ ...
├─ lib/
│    └─ getRelatedPosts.js <- this
```

As the simplest way, let's get "4 posts under the same category of the current post".

<div class="filename">/src/lib/getRelatedPosts.js</div>

```js
export function getRelatedPosts(allPosts, currentSlug, currentCats) {
  const relatedPosts = allPosts.filter(
    post =>
      post.frontmatter.slug !== currentSlug &&
      post.frontmatter.categories.includes(currentCats[0])
  )

  return relatedPosts.slice(0, 4) // get the first 4 posts with slice()
}
```

1. Get all the posts (`allPosts` - array), the current post (with `currentSlug`), and its categories (`currentCats` - array).
2. Filter down to the posts having the current first category (`currentCats` - array) except the current post (`currentSlug`) from all the posts (`allPosts` - array).
3. Get the first four posts as `relatedPosts`.

It would be possible to filter down to the posts "containing the same tag" "the order of the number of the same tags", etc. if you are very motivated to go further🙂

### Add a random select function

If you want to generate randomly selected related posts, add a random function when returning the related posts.

<div class="filename">/src/lib/getRelatedPosts.js</div>

```js
export function getRelatedPosts(allPosts, currentSlug, currentCats) {
  // random selection function
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
    post =>
      post.frontmatter.slug !== currentSlug &&
      post.frontmatter.categories.includes(currentCats[0])
  )

  return randomLot(relatedPosts, 4) // random selection
  // return relatedPosts.slice(0, 4)
}
```

## Show the related posts in the post template

Then, `[slug].astro` would be like the following;

<div class="filename">/src/pages/[slug].astro</div>

```js
---
import { getRelatedPosts } from "../lib/getRelatedPosts"

export async function getStaticPaths() {
  // Get all the posts
  const allPosts = await Astro.glob("../posts/*.md")
  // Get the number of the posts
  const numberOfPosts = allPosts.length

  return allPosts.map((post) => ({
    params: {
      slug: post.frontmatter.slug,
    },
    props: {
      post,
      // Pass the related posts props
      relatedPosts: getRelatedPosts(
        allPosts,
        post.frontmatter.slug,
        post.frontmatter.categories
      ),
    },
  }))
}

// Get the related posts props
const { relatedPosts } = Astro.props
---

// Show the related posts here
{relatedPosts.length > 0 && (
  relatedPosts.map((post) => (
    <li><a href={`/${post.frontmatter.slug}/`}>{post.frontmatter.title}</a></li>
  ))
)}
```

In general cases, you must eliminate draft posts, or make a component for the related posts. Do it as you like.

That's it!
