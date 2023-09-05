---
title: Adding <figcaption> to Markdown images [Astro 3.0]
tags:
  - astro
date: 2023-09-04
lastmod: 2023-09-04
---

Astro launched major new version 3 on 30 August, including a new image optimization.

The images that were in the public directory in v2 should be moved to the src/assets directory in v3. This would automatically optimize all images referenced within Markdown files.

(I doubt if I should say "optimized" for this conversion level, though...)

It's useful, but the output is just `<img>` tags, no caption. To solve this, I made a convert function.

That is, we just use [Cheerio](https://cheerio.js.org/) to edit the HTML output itself. For the caption, we use the `title` element.

Environment:

- Astro v3.0.7
- Cheerio v1.0.0-rc.12

## Outline

1. Install Cheerio to the project
2. Assign original HTML to Cheerio
3. For `<img>`tags, add `<figure>` and `<figcaption>` if the image has a `title` attribute.
4. Remove `<p>` wrapping `<img>` (optional)

The Markdown images should be encoded as follows:

```md
![I am `alt`](assets/example.jpg "I am `title` as caption")
```

## Install Cheerio

First, install Cheerio into the project.

```bash
# npm
npm install cheerio

# yarn
yarn add cheerio
```

## The Code

### Convert Function

Create convertHtml.js in the components directory (or others, it's up to you).

<div class="filename">src/components/convertHtml.js</div>

```js
import * as cheerio from "cheerio"

export default function convertHtml(html) {
  const $ = cheerio.load(html)
  $("img")
    .unwrap() // Remove P tags
    .replaceWith((i, e) => {
      const { src, alt, title, width, height } = e.attribs
      // If img has title
      if (title)
        return `<figure>
          <img
            src=${src}
            alt=${alt}
            loading="lazy"
            title=${title}
            width=${width}
            height=${height}
            decoding="auto"
           />
          <figcaption>${title}</figcaption>
          </figure>`
      // if img doesn't has title
      return `<img
          src=${src}
          alt=${alt}
          loading="lazy"
          width=${width}
          height=${height} 
          decoding="auto"
          />`
    })

  return $.html()
}
```

Although I have set `auto` and `lazy` for the `decode` and `load` attributes, it's completely up to you.

### Layout Component for Markdown files

Inside the layout component, import the convert function, then rewrite `<slot />` to the following code.

<div class="filename">src/layouts/MarkdownLayout.astro</div>

```js
// before
<slot />

// after
---
import convertHtml from 'components/convertHtml'
const { compiledContent } = Astro.props
const htmlContent = compiledContent()
---
//...
<Fragment set:html={convertHtml(htmlContent)} />
```

That's it!
