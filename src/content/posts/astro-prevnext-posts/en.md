---
title: Showing previous/next posts on a Astro blog page
tags:
  - astro
  - markdown
date: 2023-01-23T15:00:00.000Z
lastmod: 2023-02-15T05:58:16.695Z
draft: false
---

This post is how to show the previous/next posts on an Astro + Markdown blog page.

It can be adapted for some headless CMS and their API, I think.

The steps would be as follows;

1. Sort all posts by the date they were published
2. Get the total index number of the current post from 1
3. Get the total index number of the previous/next post from 1
4. Even if the next or previous post doesn't exist, create an empty record
5. Show both/either of the previous/next posts if they exist

Working environment

- Astro v2.0.11

## Structure of the project

In this entry, I am developing an Astro + Markdown blog with the following structure.

`[slug].astro` under `pages` is the post template, and the post URL would be something like `https://example.com/[slug]/`.

```tree
src/
├─ components/
│    └─ prevNext.astro
├─ pages/
│    └─ [slug].astro
├─ posts/
│    ├─ first-post.md
│    ├─ second-post.md
│    └─ ...
├─ utils/
│    └─ sortByDate.js
```

- `/components/prevNext.astro` Previous/Next posts Component
- `/pages/[slug].astro` Single post template
- `/utiles/sortByDate.js` function to sort posts by date

### YAML frontmatter of a Markdown Post

The YAML frontmatter of a post is defined as follows;

```md
---
title: This is my first post
slug: first-post
date: 2023-01-01
---
```

## Creating a function to sort posts by date

First, prepare a function to sort posts by date. You may already know this from Next.js or something.

<div class="filename">/src/utils/sortByDate.js</div>

```js
export const sortByDate = (a, b) => {
  return new Date(b.frontmatter.date) - new Date(a.frontmatter.date)
}
```

Since this example is with Markdown posts, I assign `frontmatter.date` to the `new Date()` argument. If you are using any API or GraphQL, assign the appropriate value.

## Generate previous/next posts within the post template

Inside `[slug].astro`, the post template, you generate previous/next posts along with the current post.

Since this is an example for a Markdown blog, I pass `frontmatter` as the properties of the previous/next posts. If either doesn't exist, pass an empty frontmatter. In case of an API, pass `slug` or another value instead.

<div class="filename">/src/pages/[slug].astro</div>

```js
---
import { sortByDate } from "./utils/sortByDate.js"

export async function getStaticPaths() {
  const allPosts = await Astro.glob("../posts/*.md")
  const numberOfPosts = allPosts.length // Total of all posts

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

Once you get the previous/next props from `Astro.props`, show them within the same template.

<div class="filename">/src/pages/[slug].astro</div>

```js
---
// ...
const { prevPost, nextPost } = Astro.props
---

// Previous post (if exists)
{prevPost.frontmatter && <a href={`/${prevPost.frontmatter.slug}/`}>{prevPost.frontmatter.title}</a>}

// Next post (if exists)
{nextPost.frontmatter && <a href={`/${nextPost.frontmatter.slug}/`}>{nextPost.frontmatter.title}</a>}
```

## Using a custom previous/next posts Component

In most cases, you will want to use a custom component for previous/next posts.

To do this, first create a component named `prevNext.astro` in the `component` directory.

<div class="filename">/src/components/prevNext.astro</div>

```js
---
const { prevPost, nextPost } = Astro.props
---

// Previous post (if exists)
{prevPost.frontmatter && <a href={`/${prevPost.frontmatter.slug}/`}>{prevPost.frontmatter.title}</a>}

// Next post (if exists)
{nextPost.frontmatter && <a href={`/${nextPost.frontmatter.slug}/`}>{nextPost.frontmatter.title}</a>}
```

Then import this component within the `[slug].astro` post template and pass the the previous/next properties.

<div class="filename">/src/pages/[slug].astro</div>

```js
---
import PrevNext from "components/PrevNext.astro" // Importing the component

// ...

const { prevPost, nextPost } = Astro.props
---

// Passing the properties
<PrevNext {prevPost} {nextPost} />
```

That's that!
