---
title: Switching an i18n blog to Gatsby.js - Reasons and design overview
tags:
  - gatsbyjs
  - jamstack
  - internationalization
date: 2023-05-10T15:00:00.000Z
lastmod: 2023-05-26T02:58:40.131Z
draft: false
---

I moved this dev blog (route360.dev) from Next.js to Gatsby.js. [I put the repository here](https://github.com/mayumih387/route360).

The main reason is that I'm much more comfortable with Gatsby.js.

## Overview and problems of a multilingual blog I created with Next.js

When I started this blog in October 2022, I organized it as follows;

- Next.js v12
- 3 languages (same as now)
- Hosted on Vercel (now on Cloudflare Pages)

Next.js was updated to version 13 in October 2022 with huge changes.　It started supporting i18n with App Router, but it costed me too much tasks.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Internationalization, too!<br><br>Even basic i18n support can be handled since the App Router&#39;s improved support for handling layouts means you can create static i18n routes that don&#39;t read the dynamic `Accept-Language` header.<a href="https://t.co/vc5zt9K9hk">https://t.co/vc5zt9K9hk</a></p>&mdash; Lee Robinson (@leeerob) <a href="https://twitter.com/leeerob/status/1640445087024029696?ref_src=twsrc%5Etfw">March 27, 2023</a></blockquote>

It might be easier to update if I run this blog in monolingual. The multilingual sites always require too much work.

Also, I feel that Next.js is much more suited for full-stack applications, as it's like an upward compatibility for the raw React.js.

On the other hand, since I'm now much used to Gatsby v5, I wanted to try a multilingual website with Gatsby.

## Benefits I could expect from switching to Gatsby.js

Since I'm used to Gatsby.js, here are the benefits I could expect from switching;

- GraphQL makes it possible to connect any kind of data (no API required)
- GraphQL makes it much easier to filter content by language
- Image optimization with gatsby-plugin-image (which I prefer to next/image)

In particular, GraphQL is a big advantage of Gatsby.js.

You can add and link any type of schema, filter and sort content more easily than using the API.

## Disadvantages and precautions of switching to Gatsby.js

There are, however, some drawbacks to switching a multilingual site to Gatsby.js.

- A lot of things to learn (I don't feel it because I'm used to it...)
- Everything can run with plugins, which scares you
- gatsby develop / gatsby build takes more time
- You can't use @vercel/og

Because Next.js doesn't have a plugin ecosystem like Gatsby, I always had to reformat Markdown or feed content with generic Node packages. It required more work, but I felt comfortable controlling everything myself.

With Gatsby.js, on the other hand, everything can be solved by plugins. Many plugins accept configurations, but you may feel uncomfortable and "black boxed".

Other differences in settings specific to multilingual sites include the following;

|                                                  | Next.js                  | Gatsby.js     |
| ------------------------------------------------ | ------------------------ | ------------- |
| domain                                           | sub-path / other domains | sub-path only |
| internal links for each locale in Markdown files | auto                     | manual        |
| current page locale                              | easy                     | manual        |

Sub-path means example.com/ja/ or example.com/en/ type of routing.

I didn't try any plugins or packages for i18n this time. It may be easier to route i18n paths if I use them.

## What I did to create a multilingual blog with Gatsby.js

As I mentioned above, I didn't use any plugins or React packages for multilingual website, but only `gatsby-node.js`'s routing.

Therefore, the site design was as follows;

1. Sub-path routing such as route360.dev/ja/, route360.dev/en/, and route360.dev/fr/
2. Once getting an access to the very top page (route360.dev), redirect works to English top page route360.dev/en/
3. The content in each language is named ja.md/en.md/fr.md under folder with the slug name
4. To create each individual post page, I call the query separately for each language and create paths in `gatsby-node.js`, then pass the locale `pageContext` to individual post page template for language determination
5. Check if the post has translation(s) with the `query` of allMarkdownRemark + slug filter inside the template (if so, show the link(s) to the translation(s))
6. To create archive pages, I call the query separately for each language and create paths in `gatsby-node.js`, then pass the locale `pageContext` to the archive page template for language determination
7. Generate RSS for each language
8. Generate date format for each language

Check out [the repository](https://github.com/mayumih387/route360) if you are interested in, as I am opening it to the public.

I'll cover the details in other blog posts.

## Conclusion

### Impressions of reworking a multilingual blog with Gatsby.js

[When I was building a multilingual site with Astro](/ja/post/astro-i18n/), I had to place content under each language folder to follow its routing system. It was nice that Gatsby's `gatsby-node.js` allowed me to place them wherever I wanted.

Also, with the previous blog using Next.js, I wasn't very able to check if each individual post had translation(s), and links and metadata to headers were displayed even if there were no translated articles. But now with GraphQL, I can easily filter posts by language, so I can hide links and metadata if the post doesn't have translation.

This allows me to release only the Japanese version first without waiting for the translation.

### Future aspects

#### TypeScript maybe?

I didn't include TypeScript because I don't think it's needed at the moment. If I get motivated in the future, I might try to rewrite files.

#### Auto OGP images

Hopefully in the future I'd like to integrate an automatic OGP image generator like GitHub's.
