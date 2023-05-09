---
title: Frontend architecture of this website
tags:
  - nextjs
  - markdown
  - jamstack
date: 2022-10-04T06:09:39.997Z
lastmod: 2022-10-27T05:59:00.548Z
draft: false
---

Let me introduce the architecture of this website (route360.dev).

## React Framework: Next.js

I chose [Next.js](https://nextjs.org/) because it was easier to implement internationalization than Gatsby.js. This is my first time making a website using Next.js.

I'd been trying to make a website with Gatsby.js at first.

Gatsby.js is very useful and easy for developing websites not very "React apps", but I felt it's not that capable of multilingual websites. One of the reasons is its internationalization/localization plugins are a bit outdated; Official plugins or third-party's are not updated for years, moreover, official plugins' GitHub pages return "404 not found".

### Internationalization

With Next.js, the internationalization is very simple; just add an i18n settings into `next.config.js`.

`next.config.js` of this website (extracted)

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
  trailingSlash: true,
}

module.exports = nextConfig
```

Of course, you need to add other settings for SEO, but all the local links will be redirected automatically to appropriate language pages only with this setting. I don't use any libraries or modules.

## UI Framework: none

No UI Framework is installed. Only css modules.

## Headless CMS: none (only Markdown)

Though I was making this website with [DatoCMS](https://www.datocms.com/) first, their free plan includes only 300 recodes, which is too small. So I re-made this with local Markdown contents.

If you are planning a website with less than two languages, [Contentful](https://www.contentful.com/) offers a good internationalization option with their free plan (including 25k recodes). As I wanted three languages this time, I didn't choose it.

As DatoCMS provides all the data with GraphQL, it was not that difficult for me who knows Gatsby.js. Its Real-time Preview is practical too.

## Hosting: Vercel

https://vercel.com/

I preferred [Cloudflare Pages](https://pages.cloudflare.com/) as a host, but with the i18n setting, Next.js doesn't support `next export` which is required to deploy Next.js on them. So, I had no choice but Vercel (it worked on Netlify as well, though)

## Others

* Comment system - [giscus](https://giscus.app/)
* Webfont - [Fontawesome](https://fontawesome.com/)
* Syntax highlighter - [Prism.js](https://prismjs.com/)
* Translation - me😅 with a lot of help by DeepL and dictionaries...

## Conclusion

I built this website as studying Next.js at the same time. Though I got flustered with the difference between Next.js and Gatsby.js, hopefully I made it.

As I understood how to make a multilingual website, I'd like to re-build my WordPress WPML sites with Next.js soon.