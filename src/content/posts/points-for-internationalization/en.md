---
title: How I built this site with Next.js + Markdown + i18n
tags:
  - nextjs
  - internationalization
  - markdown
date: 2022-10-15T07:47:08.532Z
lastmod: 2022-10-27T05:45:29.990Z
draft: false
---

Here is my note about how I built this multilingual website (route360.dev) from the beginning.

What was hard for me is calling local Markdown files in several languages, as I decided not to use any Headless CMS.

With Headless CMS, content management and paginating (I won't explain about pagination this time) would be much easier. If I had to choose one of the free plans, I prefer [Hygraph](https://hygraph.com/) for two languages, or [Prismic](https://prismic.io/) for three or more languages.

<span class="label warning">Related post</span> [Headless CMS comparison for an international website](/en/post/cms-internationalization/)

Working environment:

- Node.js v16.18.0
- React v18.2.0
- Next.js v12.3.1
- prismjs v1.29.0

## Add locales to next.config.js

First of all, you have to add locales to `next.config.js`.

As this blog is run in 3 locales (English as default, French and Japanese), the setting is as below;

<div class="filename">/next.config.js</div>

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['en', 'fr', 'ja'],
    defaultLocale: 'en',
  },
}

module.exports = nextConfig
```

This setting is for "Sub-path Routing".

- for the default locale: `example.com`
- others: `example.com/fr` or `example.com/ja`

You can choose "Domain Routing" as well. Please refer to the Next.js official guidance.

<span class="label warning">Reference</span> [Internationalized Routing | Next.js](https://nextjs.org/docs/advanced-features/i18n-routing)

❗The i18n setting is not supported by `next export`. Be careful of the selection of hosting services because some of them (such as Cloudflare Pages) require `next export` to deployment.

### Get locales through useRouter()

Once adding i18n setting to `next.config.js`, all the information about locales can be fetched through `useRouter()` of Next.js.

```js
import { useRouter } from 'next/router'

export default function SomeComponent() {
  const { locale, defaultLocale, locales } = useRouter()
  return (
    <>
      <p>Current locale is { locale }.</p>
      <p>The default locale is{ defaultLocale }.</p>
      <p>The locales in the setting are {locales.map((locale) => `${locale},`)}.</p>
    </>
  )
}
```

An example of output:

```md
Current locale is en.
The default locale is en.
The locales in the setting are en, fr, ja,.
```

This makes it easy to separate contents by language in Components or Templates.

## Consider where to store Markdown files

There are many options to store the post files. The following is how I make the folder structure of directory;

```treeview
projectRoot
├ /pages/
│  ...
├ /posts/
│ ├ /first-post/
| | ├ en.md
| | ├ fr.md
| | └ ja.md
| ├ /second-post/
| | ├ en.md
| | ├ fr.md
| | └ ja.md
```
- Directory path -> slug of the post
- File name -> locale

It's completely up to you. You may prefer to name those files as `slug.lang.md`.*

*Example: `first-post.en.md`

Those directory/file names affect how and from where you retrieve the elements to make a path (slug).

In this post, I use the directory path name as a post slug. Arrange and make the codes suitable to your situation.

## Post (article) page

The first key point is the article page.

You might already know how to create paths, but now you must think about the case "A post in English is ready but not yet in French".

### In case of no translation of a post

In this blog, I created all the post paths for all languages. Then, for the cases where there isn't the translation(s) for a post,

- Show "Sorry, no translation in this language is available yet".
- Add `noindex` to `<meta>` tag ([be discussed later](#metadata-for-each-locale))

So the steps would be;

1. Create all paths for all languages even though there are some posts without translations
2. Separate contents by each case (if a translation is available or not)

### Create paths - getStaticPaths

So now, create paths (which composes URL) with `getStaticPaths`.

In my case, I create a directory named `/post/` inside `/pages/`, then put `[slug].js`* as the post page template.

*It's the file name for the template using slug as path. The path would be something like `example.com/post/first-post/`.

```treeview
projectRoot
├ /pages/
│ ├ /post/
| | └[slug].js <-- this
│ ├ _app.js
│ └ index.js
├ /posts/
│ ├ /first-post/
| | ├ en.md
| | ├ fr.md
| | └ ja.md
```

Then, import `fs` and `path` modules for managing local files. Installation is not required as they are one of the default modules of Node.js.

<div class="filename">/pages/post/[slug].js</div>

```js
import fs from 'fs'
import path from 'path'
```

Now let's create paths with `getStaticPaths`.

To generate paths of each post for all locales, get and `map()` all directory names under `/pages/posts/`, then make an array of slug + locale.

<div class="filename">/pages/post/[slug].js</div>

```js
//...

export async function getStaticPaths({ locales }) {
  // get all directory names under /posts/
  const dirnames = fs.readdirSync(path.join('posts'))
  // Prepare an empty array to store paths w/locale
  const pathsArray = []

  //List all directory names for all locales
  dirnames.map((dirname) => {
    locales.map((language) => {
      pathsArray.push({ params: { slug: dirname }, locale: language })
    })
  })

  return {
    paths: pathsArray,
    fallback: false,
  }
}
```

The generated `pathArray` contains those parameters as we can see them by `console.log()`;

```js
[
  { params: { slug: 'first-post' }, locale: 'en' },
  { params: { slug: 'first-post' }, locale: 'fr' },
  { params: { slug: 'first-post' }, locale: 'ja' },
  { params: { slug: 'second-post' }, locale: 'en' },
  { params: { slug: 'second-post' }, locale: 'fr' },
  { params: { slug: 'second-post' }, locale: 'ja' },
]
```

With this array, we generate post content by calling Markdown files for each slug of `params` and `locale`.

### Make content data - getStaticProps

The basic code for contents creation is like below;

<div class="filename">/pages/post/[slug].js</div>

```js
//...

// Receiving params and locale generated in getStaticPaths
export async function getStaticProps({ locale, params: { slug } }) {
  // 1. Read the markdown file, and get contents inside

  // 2. Return data to use in frontend
  return {
    props: {
    },
  }
}
```

The metadata (such as title, date, etc.) should be defined as YAML Frontmatter at the very beginning of each Markdown file. To retrieve the metadata, import `matter` of [gray-matter](https://github.com/jonschlinkert/gray-matter). *gray-matter has to be installed.

<div class="filename">/pages/post/[slug].js</div>

```js
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter' //<-- this
```

So now we're going to generate post content with Markdown files, but one thing: If some translations are not ready, the code returns an error.

To avoid the error, use `try...catch` of javascript.

<span class="label warning">Reference</span> [try...catch - JavaScript - MDN Web Docs](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/try...catch)

In safe cases, the code inside `try` runs, and in error cases, the code inside `catch` runs.

If an expected translated Markdown file doesn't exist, and if it goes `catch`, I return an empty `title`; which could be used for displaying different content by the existence of `title`.

<div class="filename">/pages/post/[slug].js</div>

```js
//...

// Receiving params and locale generating in getStaticPaths
export async function getStaticProps({ locale, params: { slug } }) {
  // 1. Read the Markdown file, and get contents inside
  try {

    // 2-A. Return content to frontend
    return {
      props: {
      },
    }
  } catch (e) {
    // 2-B. In case translation file doesn't exist, return an empty title
    return {
      props: {
        frontmatter: {
          title: '',
        },
        // content: 'No content!',
      },
    }
  }
}
```

Inside of `try`, I added the code like this;

<div class="filename">/pages/post/[slug].js</div>

```js
//...

export async function getStaticProps({ locale, params: { slug } }) {
  try {
    // 1-1. Read the markdown file, and get contents inside
    const markdownWithMeta = fs.readFileSync(
      path.join('posts/' + slug + `/${locale}.md`),
      'utf-8'
    )
    // 1-2. Get metadata through Frontmatter and content
    const { data: frontmatter, content } = matter(markdownWithMeta)

    // 2-A. Return content to frontend
    return
      {
        props: {
          frontmatter: JSON.parse(JSON.stringify(frontmatter)),
          content,
        },
      }
  } catch (e) {
    //...
  }
}
```

Note: In this blog, I re-separate the content again inside `try` in case Frontmatter has `draft: true`.

### Output for frontend

So, it's ready now to display metadata of `frontmatter` and `content` in the frontend. The code must be like the following;

<div class="filename">/pages/post/[slug].js</div>

```js
//...

export default function Post({
  frontmatter: { title, date },
  content,
}) {
  return (
    <>
      <h1>{title}</h1>
      <article dangerouslySetInnerHTML={{__html: marked(content)}} />
      {/* Convert Markdown to HTML with marked */}
    </>
  )
}
```

Plus, in case the translation doesn't exist, I show "Translation isn't available" thing. It's possible to divert the content by the presence of `title`.

Also, to change the sentence "Translation isn't available" by locales, use `locale` which is a parameter of `useRouter()`.

<div class="filename">/pages/post/[slug].js</div>

```js
//...
import { useRouter } from 'next/router'

export default function Post({
  frontmatter: { title, date },
  content,
}) {
  const { locale } = useRouter() {/* Get current locale here */}
  return title !== '' ? (
    <>
      <h1>{title}</h1>
      <article dangerouslySetInnerHTML={{__html: marked(content)}} />
    </>
  ) : (
    <>{/* If there isn't the translation */}
      <h1>Sorry!</h1>
      {locale === 'en' && (
        <p>Sorry, this entry is not available yet in English.</p>
      )}
      {locale === 'fr' && (
        <p>Pardonnez-moi, cet article n&#39;est pas encore disponible en français.</p>
      )}
      {locale === 'ja' && (
        <p>この記事はまだ日本語に訳せておりません。ごめんなさい。</p>
      )}
    </>
  )
}
```

In most cases, Components must be used. Please justify the code above for your situation.

### Date format by language

Date formats vary by region or language.

In this blog, dates are displayed like this;

- English: Sep 30, 2022
- French: le 30 sept. 2022
- Japanese: 2022-9-27

To do so, I made a Component for converting date format by locale.

First, import a module [date-fns](https://github.com/date-fns/date-fns) inside the Component (install required).

<div class="filename">/components/convert-date.js</div>

```js
import { parseISO, format } from 'date-fns'
import ja from 'date-fns/locale/ja'
import en from 'date-fns/locale/en-US'
import fr from 'date-fns/locale/fr'
import { useRouter } from 'next/router'

export default function ConvertDate({ dateISO }) {
  const { locale } = useRouter()
  return (
    <time dateTime={dateISO}>
      {locale === 'en' &&
        format(parseISO(dateISO), 'MMM d, yyyy', { locale: en })}
      {locale === 'fr' &&
        format(parseISO(dateISO), 'd MMM yyyy', { locale: fr })}
      {locale === 'ja' && format(parseISO(dateISO), 'yyyy-M-d', { locale: ja })}
    </time>
  )
}
```

Also, import each locale file from `date-fns`, and divide output by locale.

Then, call this Component inside `[slug].js`, and pass the date data through the Component.

<div class="filename">/pages/post/[slug].js</div>

```js
//...
import ConvertDate from 'components/convert-date'

export default function Post({
  frontmatter: { title, date },
  content,
}) {
  return title !== '' ? (
    <>
      <h1>{title}</h1>
      <ConvertDate dateISO={date} /> {/* <-- this */}
      <article dangerouslySetInnerHTML={{__html: marked(content)}} />
    </>
  ) : (
    {/* Result in case no translation is available */}
  )
}
```

### Comment system

I use [giscus](https://giscus.app) for the comments.

Because giscus can change language, I switch its language by the current locale.

<div class="filename">/components/comments.js</div>

```js
import Giscus from '@giscus/react'
import { useRouter } from 'next/router'

export default function Comments() {
  const { locale } = useRouter() {/* <-- current locale */}
  return (
    <Giscus
      repo="[your repository]"
      repoId="[repository ID]"
      category="[category]"
      categoryId="[category ID]"
      mapping="title"
      reactionsEnabled="1"
      emitMetadata="1"
      theme="preferred_color_scheme"
      lang={locale} {/* <-- set locale here */}
      crossOrigin="anonymous"
    />
  )
}
```

You can check other properties at [giscus official](https://giscus.app/)

In my case (this blog), I didn't add the lazyload property as it caused a DOM error when the language is switched (Task no.1🙁).

## Post list page

For the post list page (`/pages/index.js` in this blog), you have to consider again the case when there are not-translated posts.

Of course, you can use other files for list posts, `/pages/post/index.js` for example.

Because the list page doesn't require Dynamic Routes](https://nextjs.org/docs/routing/dynamic-routes), you don't need `getStaticPaths` to generate paths. Only `getStaticProps` is required for generating what to show in the frontend.

### Make contents for the list page - getStaticProps

The key is the same as the article page.

Because an error can happen when trying to nonexistent translation files, use `try...catch` here again.

<div class="filename">/pages/index.js</div>

```js
export async function getStaticProps({ locale }) {
  const dirnames = fs.readdirSync(path.join('posts'))

  const data = dirnames
    .map((dirname) => {
      try {
        // Get all locale files by dirname (which consists slug of each post)
        const markdownWithMeta = fs.readFileSync(
          path.join('posts/' + dirname + `/${locale}.md`),
          'utf-8'
        )
        const { data: frontmatter, content } = matter(markdownWithMeta)
        return (
          slug: dirname,
          frontmatter,
          content
        )
      } catch (e) {
        // console.log(e.message)
      }
    })
    // Eliminate `undefined` content generated by `catch`
    .filter((e) => e)

  const posts = JSON.parse(JSON.stringify(data))

  return {
    props: {
      posts: posts
    },
  }
}
```

Now you should be able to see the article list. However, the order isn't by date yet.

To re-order the posts by date, prepare a function to sort items. I put this function under the utility directory.

<div class="filename">/utils/index.js</div>

```js
export const sortByDate = (a, b) => {
  return new Date(b.frontmatter.date) - new Date(a.frontmatter.date)
}
```

Then import this function inside `/pages/index.js`, and sort the returned `posts`.

<div class="filename">/pages/index.js</div>

```js
//...
import { sortByDate } from 'utils'

export async function getStaticProps({ locale }) {
  //...

  return {
    props: {
      posts: posts.sort(sortByDate) {/* <-- this */}
    },
  }
}
```

<span class="label warning">Reference</span> [Static Blog With Next.js and Markdown - Traversy Media | YouTube](https://www.youtube.com/watch?v=MrjeefD8sac)

That's all for the post list page sorted by date.

*Though I won't explain this time how to paginate, I imagine it'd be possible if you could understand the codes above I've just explained.

## Pages of nested routes

For the translation of the pages without [Dynamic Route](https://nextjs.org/docs/routing/dynamic-routes), I divide the contents by using `{ locale }` which can be retrieved from `useRouter()`.

For example, it looks like the following at the ABOUT page `/pages/about.js`.

<div class="filename">/pages/about.js</div>

```js
import { useRouter } from 'next/router'

export default function About() {
  const { locale } = useRouter()
  return (
    <article>
      {locale === 'en' && (
        <p>Hi! I&#39;m Mayumi (she/her). Thanks for visiting my website.</p>
        )
      }
      {locale === 'fr' && (
        <p>Coucou ! Je suis Mayumi (elle). Merci pour visiter mon site web.</p>
        )
      }
      {locale === 'ja' && (
        <p>こんにちは、Mayumiです。サイトをご覧下さりありがとうございます。</p>
        )
      }
    </article>
  )
}
```

It's up to you, importing contents from other local files would be okay too.

## Language switcher

For the Language Switcher, I made a Component for it. *No styles are applied in the following code.

<div class="filename">/components/language-switcher.js</div>

```js
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function LanguageSwitcher() {
  const { locales, asPath } = useRouter()
  return (
    <ul>
      {locales.map((lang) => (
        <li key={lang}>
          <Link href={asPath} locale={lang} hrefLang={lang} rel="alternate">
            <a>
              {lang.toUpperCase()}
            </a>
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

1. Get all the locales with `const { locales } = useRouter()` set in next.config.js, and list all of them with `map()`.
2. For href of the Link, add the path to other languages with `const { asPath } = useRouter()`.

For example, if the current page is `/about/`, the switcher outputs `/fr/about/` for French, or `/ja/about/` for Japanese.

## Metadata for each locale

Metadata for SEO is the thing that made me tired the most.

I won't show the exact code here, but I show what I did for this blog.

### Expected output result of metadata

```html
<!-- Output result -->
<title>[Localized title]</title>
<link rel="canonical" href="[Localized URL]" />
<meta name="description" content="[Localized description]" />
<meta property="og:title" content="[Localized title]" />
<meta property="og:description" content="[Localized description]" />
<meta property="og:url" content="[Localized URL]" />
<meta property="og:site_name" content="[Localized site title]" />
<meta property="og:locale" content="[Current locale]" />
```

### Metadata according to Google guidance about internationalization

```html
<!-- Output result -->
<link rel="alternate" hreflang="en" href="[English translation of current page]">
<link rel="alternate" hreflang="fr" href="[French translation of current page]">
<link rel="alternate" hreflang="ja" href="[Japanese translation of current page]">
<link rel="alternate" hreflang="x-default" href="[Default locale of current page]">
```

<span class="label warning">Reference</span> [Localized Versions of your Pages | Google Search Central](https://developers.google.com/search/docs/specialty/international/localized-versions)

### Schema for each locale

I generate Schema, for the Rich Results of Google, inside each template (such as `/pages/post/[slug].js`) and pass it through Meta Component.

```html
<!-- Output result -->
<script type="application/ld+json">
  [Localized Schema]
</script>
```

### noindex for posts whose translation doesn't exist

If the translation of a post doesn't exist, the post pages without content shouldn't be crawled by search engines.

```html
<!-- Output -->
<meta name="robots" content="noindex,nofollow" />
```

In the section [Output for frontend](#output-for-frontend) of this article, I divide the frontend by the presence of translation. Only when the post pages without translation are displayed, pass the `noIndex` property to Meta Component.

<div class="filename">/pages/post/[slug].js</div>

```js
//...
import Meta from '/components/meta'

export default function Post({
  frontmatter: { title, date },
  content,
}) {
  return title !== '' ? (
    <>
      <Meta /> {/* normal meta */}
      <h1>{title}</h1>
      <article dangerouslySetInnerHTML={{__html: marked(content)}} />
    </>
  ) : (
    <>{/* When no translation is available */}
      <Meta noIndex /> {/* pass noIndex prop to Meta Component */}
      <h1>Sorry!</h1>
      {locale === 'en' && (
        <p>Sorry, this entry is not available yet in English.</p>
      )}
      {locale === 'fr' && (
        <p>Pardonnez-moi, cet article n&#39;est pas encore disponible en français.</p>
      )}
      {locale === 'ja' && (
        <p>この記事はまだ日本語に訳せておりません。ごめんなさい。</p>
      )}
    </>
  )
}
```

The meta component is something like this;

<div class="filename">/components/meta.js</div>

```js
//...
export default function Meta({ noIndex = false }) {
  //...
  return (
    //...
    {noIndex && <meta name="robots" content="noindex,nofollow" />}
    //...
  )
}
```

In the case when no translation is available, probably I shouldn't output [Metadata according to Google guidance about internationalization](#metadata-according-to-google-guidance-about-internationalization), but I haven't reached yet to divide the data (Task no.2 🙁)

## Sitemap

Though there are some sitemap modules by third-parties, they are not optimized for international pages (according to my research).

Therefore, I do hard-coding sitemap.xml whenever a new post is added😱. I should automate it with Python or something (I'm not capable of making a module by myself...)

<span class="label warning">Reference</span> [Localized Versions of your Pages | Google Search Central](https://developers.google.com/search/docs/specialty/international/localized-versions)

This article above by Google says about internationalization. You can see this is much more complicated than websites in one language.

It'd be better to optimize like Google mentions, as making a multilingual site is already heavy work.

## RSS feeds

Each locale has a feed.

- feed.en.xml
- feed.fr.xml
- feed.ja.xml

To generate feeds, install a Node.js package called [feed](https://github.com/jpmonette/feed)

## Others

### Loading Prism.js

For the loading of Prism.js as a syntax highlighter, I do the following;

<div class="filename">/pages/post/[slug].js</div>

```js
const { locale, asPath } = useRouter()

useEffect(() => {
  Prism.highlightAll()
}, [locale, asPath])
```

Many tech blogs I referred to didn't add the second dependencies (`[locale, asPath]` here), and it didn't work for me when the language is switched. That's why I added them so that Prism.js is rendered every time of page transitions.

*With `events` which can be retrieve from `const { events } = useRouter()`, it didn't work well.

## Thoughts after making international site (conclusion)

It was much harder to prepare a multilingual website than I imagined. Although translation is already tiring, there are lots of things besides it.

Because I generate all the paths even for non-translated posts this time, it'd be better to publish after all the translations are ready for SEO. This method is just temporary for "non-translated posts".

As I've added many elements to this website, those codes are a bit more complicated. I hope to make the repository open once the version becomes stable in the future.