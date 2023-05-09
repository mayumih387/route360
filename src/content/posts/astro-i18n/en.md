---
title: Making an i18n website with Astro
tags:
  - astro
  - internationalization
date: 2022-12-17T03:00:00.000Z
lastmod: 2023-02-24T04:20:37.505Z
draft: false
---

I've renewed my old multilingual WordPress website to an Astro site.

Here 👉[Visit Palestine](https://visit-palestine.net/en/)

*The information on this website is not the latest, so for reference purposes.<br />
**Ads will be displayed. Please do not open if you wouldn't like to see ads.

Astro doesn't indicate the website's internationalization on their docs, but it's not that difficult because of its routing system; URLs are generated once you put files under the src folder. *As long as it's a sub-path routing with markdown files.

As you might already notice, [Astro official docs](https://docs.astro.build/en/getting-started/) is well internationalized with sub-path routing.

On the other hand, because Astro isn't optimized for internationalization like Next.js, there are works to do.

As I have experience with an i18n Next.js site (this site, route360.dev), I'm comparing Astro and Next.js about some points.

Working environment

- astro v.2.0.15

## Impression and thoughts about the i18n Astro site

Though this was my first Astro website, I could get into it as I've used Next.js and Gatsby. Integrating React was so easy.

I imagine Astro designers are making it improving some of the unnecessary/uncomfortable systems of Next.js.

Meanwhile, Astro image optimization is not as gorgeous as next/image and gatsby-plugin-image, and it required me to work (I can't say I could completely optimize images yet).

### Though I've tried 11th, too...

I've tried [11ty](https://www.11ty.dev/) for this website renewal before Astro.

It is because 11ty was highly recommended for static websites at Jamstack Conf 2022.

<iframe width="560" height="315" src="https://www.youtube.com/embed/AMCn7FwrUV0?start=1599" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

11ty will support i18n with its official plugin from version 2.0.0. It allows filtering languages or so.

However, I've never learned about Nunjucks before, and it took me time to understand. Then, I tried Astro and reached to understand it easily.

Once you are used to Nunjucks, 11ty + i18n must be easy.

## What I did for an Astro i18n website

### How to get the current locale

In the case of [Astro official documents](https://docs.astro.build/en/getting-started/), the current locale is retrieved from the current URL.

<span class="label warning">Reference</span> [util.ts | withastro/docs - GitHub](https://github.com/withastro/docs/blob/main/src/util.ts)

<div class="filename">/src/util.ts</div>

```ts
export function getLanguageFromURL(pathname: string) {
  const langCodeMatch = pathname.match(/\/([a-z]{2}-?[a-z]{0,2})\//);
  return langCodeMatch ? langCodeMatch[1] : 'en';
}
```

On [our website](https://visit-palestine.net/en/), I did almost the same thing referring to it.

There can be considered other approaches, such as adding a `lang` key and value to the Markdown front matter or getting a language from API/Graph QL if you are using a CMS.

### Language switcher (language selector)

I'm always wondering if I need a language switcher, but I always add it...

In Astro docs, the language switcher (selector) function is realized with javascript (typescript).

<span class="label warning">Reference</span> [LanguageSelect.tsx | withastro/docs  - GitHub](https://github.com/withastro/docs/blob/main/src/components/Header/LanguageSelect.tsx)

<div class="filename">/src/components/Header/LanguageSelect.tsx</div>

```js
<select
  className="header-button language-select"
  value={lang}
  aria-label="Select language"
  onChange={(e) => {
    const newLang = e.target.value;
    const [_leadingSlash, _oldLang, ...rest] = window.location.pathname.split('/');
    const slug = rest.join('/');
    window.location.pathname = `/${newLang}/${slug}`;
  }}
>
```

On [our website](https://visit-palestine.net/en/), I did a hard coding (I know I shouldn't, though) after getting the current slug from the current path.

```js
---
const currentPath = Astro.url.pathname
const slug = currentPath === '/404/' ? '' : String(currentPath).substring(4)
---

...

<ul>
  <li><a href={`/en/${slug}`}>English</a></li>
  <li><a href={`/ja/${slug}`}>日本語</a></li>
</ul>

```

### Custom 404 page for each locale

We can realize the custom 404 page in Astro by putting `404.astro` or `404.md` under the `page` directory.

Looking at the [Astro Docs](https://docs.astro.build/en/getting-started/) on GitHub, their custom 404 page par locale is generated as following steps;

1. Make `/page/404.astro`
2. Make `/page/[lang]/404.astro` then read it in `/page/404.astro`
3. Generate 404.html for each locale at astro build
4. Show `/[lang]/404.html` instead of `/[lang]/*` when the status code returns 404 with Netlify redirects. Only when the URL is `/*`, it returns the English 404 page.

The 4th step annoys me because I wanted to use Cloudflare Pages; Cloudflare Pages doesn't support 404 redirects yet as of December 2022.

<span class="label warning">Reference</span> [Redirects · Cloudflare Pages docs](https://developers.cloudflare.com/pages/platform/redirects/)

Because Netlify doesn't offer a free CDN server in Japan (only for the pro plan), I'm not willing to choose it. Or Firebase hosting seems very cumbersome with their CLI...

### XML Sitemap

Astro provides [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/), an official sitemap generator plugin.

This plugin adapts to i18n, but I haven't tried it.

Because [our website](https://visit-palestine.net/en/) is not a blog, and I'm not planning to add new pages, I generate XML sitemap by using an online sitemap generator and text replacements.

## Things that look hard with an Astro i18n website

Other things require some work, though I haven't tried them with [our website](https://visit-palestine.net/en/) this time.

### Domain i18n routing

example: example.com + example.jp, or en.example.com + ja.example.com

We can choose a domain routing besides sub-path routing in Next.js. However, only sub-path in Astro.

### RSS feed

It demanded me a bit of hard work to realize the RSS feed for each language in Next.js.

<span class="label warning">Related post</span> [RSS feed for Next.js multilingual Markdown blog](/en/post/rss-feed-multilingual/)

Astro also provides [@astrojs/rss](https://docs.astro.build/en/guides/rss/#setting-up-astrojsrss), an official RSS plugin.

Because we can customize feed texts or feed URLs, it's possible anyway to generate an RSS feed for each language.

### Default locale contents under the root directory (not under language dir)

Astro routing is the same as its directory structure under `pages`.

Therefore, it would be complicated if you want to realize no sub-path for the default locale such as the Next.js website (like this website, [route360.dev](/)).

11ty routing is the same as Astro.

## Conclusion

Because Astro official docs are multilingual and its GitHub repository is public, I referred to it several times, thankfully.

Adding other languages seems not that difficult unless it's not an RTL language...

Astro itself is developer friendly if you have already experienced Next.js or other UI frameworks. I like it!

### References

- [astro Docs](https://docs.astro.build/en/getting-started/)
- [withastro / Docs - GitHub](https://github.com/withastro/docs)
- [11ty](https://www.11ty.dev/)