---
title: Gatsby's advantages - Why I still love Gatsby much more than other frameworks
tags:
  - gatsbyjs
  - nextjs
  - react
date: 2023-08-16
lastmod: 2023-08-16
draft: false
---

I have been using several frontend frameworks for years, but I came back and finally settled in Gatsby. Unfortunately, the popularity of Gatsby has been declining. However, it's a shame if you never try it because of its reputation.

Gatsby has great advantages that other frameworks don't have. I believe Gatsby deserves to be used in many projects!

So, as a heavy user of Gatsby, I would like to explain the advantages (and some disadvantages) of Gatsby in this article.

The frameworks I have tried are as follows. Most purposes are for building websites.

- Gatsby
- Next.js (I don't understand App Router yet...)
- Astro
- 11ty (just tried basic tutorial)
- Svelte/SvelteKit (just tried basic tutorial)

## Gatsby's advantages

### You can unify any data/API into a GraphQL

The most powerful feature of Gatsby, in my opinion, is **the data unification feature**. Any data in any place can be unified into any schema(s) of a GraphQL.

<blockquote class="twitter-tweet" data-theme="dark"><p lang="en" dir="ltr">I&#39;m so impressed by Qwik, Remix, Next, etc, and would love to use them. But no one has solved the data layer as well as <a href="https://twitter.com/GatsbyJS?ref_src=twsrc%5Etfw">@GatsbyJS</a>. There&#39;s not even any competition. To be able to glue together APIs and make sense of them altogether is incredibly powerful.</p>&mdash; David Paulsson (@davidpaulsson) <a href="https://twitter.com/davidpaulsson/status/1653797711810797569?ref_src=twsrc%5Etfw">May 3, 2023</a></blockquote>

For example, you might manage a website's data as follows:

- Content on some CMS
- Comments on Firebase
- Pageviews on Google Analytics

With traditional REST, we have to connect to each API and fetch everything first, then filter it by slug or some conditions to get the desired result.

On the other hand, Gatsby allows us to integrate all the data managed in different places into one GraphQL, by connecting to each API in `gatsby-node.js`. Because it's much easier to filter and sort the data with GraphQL, you can get "The top 10 most viewed articles' titles and comments" for a second.

The article below explains very well about the difference between REST and GraphQL.

Link - [GraphQL vs REST: Everything You Need To Know | kinsta.com](https://kinsta.com/blog/graphql-vs-rest/)

![GraphQL of Gatsby](../../../images/gatsby-graphql01.png "Example: Create a pageViews schema and glue Markdown data to it.")

The data we can integrate is not just APIs. The files like xlsx, yaml or json can be glued together if they have common values like slugs.

So **this data integration feature is the one and only powerful feature that Gatsby has**. No other frameworks have it.

### GraphQL itself is also useful

GraphQL itself is useful for data processing compared to REST.

Because pure REST doesn't have the functions to sort and filter, we generally have to create those functions ourselves. GraphQL does.

Filtering by draft/published and tags, or sorting by date ACS/DESC is a breeze. Because we can quickly locate the data we want, we can speed up our work.

### React-based

Gatsby is a React-based framework, so we can take advantage of its rich ecosystem. The same goes for Next.js, since Next.js is also React-based.

These days, new frameworks like Solid.js or Svelte, which cover React's shortcomings, are becoming more popular than React. But their ecosystem is not that big yet.

React, on the other hand, still has a large community of developers. From popular plugins like FontAwesome or Swiper to small services from individual developers releasing their official React libraries. If you want to add some functionality from the outside, you would never get lost.

Also, we can't forget that React is developed by Meta, the Facebook company. Also, Next.js (by Vercel), the most popular framework, is based on React. The backbone is so strong that we don't have to worry about React losing its reputation so soon.

### Poweful image plugin

Gatsby has [gatsby-plugin-image](https://www.gatsbyjs.com/plugins/gatsby-plugin-image/), a great plugin for image optimization.

I have integrated it with [gatsby-remark-images](https://www.gatsbyjs.com/plugins/gatsby-remark-images/) in this blog. Only with them, the image output is already optimized with blur and set of images (srcset).

Next.js also has [next/image](https://nextjs.org/docs/pages/api-reference/components/image), but it only works as component but doesn't convert images inside API content. When you want to convert images, you have to prepare the code by yourselves to get the whole content of the article then convert the images.

## What disappoints me about Gatsby...

### Not so energetic after being acquired by Netlify?

In June 2023, Netlify acquired Gatsby. After that, many engineers were laid off from Netlify. [Lennart](https://twitter.com/lekoarts_de) is one of them, although he helped many developers (including me) in Gatsby's official GitHub discussions.

Also, Gatsby hasn't released a newer version for 2 months since the current latest v5.11.0 on June 15, 2023. I wonder if there is still some confusion since the acquisition...

### Development starts slowly

Compared to Next.js, Astro and Svelte (SvelteKit), building `gatsby develop` is much slower. The more pages you have, the slower the build will be if the PC has little RAM.

As for the `gatsby build`, I don't think it's slower than other frameworks because it depends on how many images you want to generate. For your information, the build time of this blog on Cloudflare Pages is less than 3 minutes.

### About learning cost

After completing [a 50-hour React course on Udemy](https://www.udemy.com/course/react-the-complete-guide-incl-redux/), I understood that Next.js is designed to cover the drawbacks of React, such as SEO issues or routing. It seems to me that it is still close to React.

In comparison, Gatsby is a bit far and very characteristic. I said "You can unify any data/API into a GraphQL" at the beginning of this article, but you still have to learn Gatsby's original functions.

You might be confused about using GraphQL as an API, too. However, GraphQL for frontend is just fetching data like REST. I don't think it's that hard.

Once you have these points resolved, the only thing left is React. If you're familiar with React, you should be fine.

## Conclusion

Since Next.js is getting more complicated now, I suggest you use Gatsby if you love React.

Although I'm a heavy user of Gatsby, I'm not yet comfortable with the latest slice feature or file-based routing. But Gatsby is still appealing and made me come back after experiencing Next.js and Astro.

Multilingual websites? Yes, it's possible, just like this blog!