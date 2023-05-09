---
title: How to add the table of contents to a Markdown blog
tags:
  - markdown
  - nextjs
  - gatsbyjs
date: 2022-11-10T01:00:00.208Z
lastmod: 2022-11-10T01:00:00.208Z
draft: false
---

You can see the Table of Contents of this blog post above. This post is about how to do it.

I referred to this blog below, thank you!

<span class="label warning">Reference</span> [Next.js + Markdown (marked) で作るブログサイト](https://chocolat5.com/tips/markdown-blog-nextjs/#%E7%9B%AE%E6%AC%A1%EF%BC%88table-of-contents%EF%BC%89)

My codes are based on hers and arranged some of the points.

Working environment:

- Next.js v12.3.1
- marked 4.2.2

## Steps to follow

First, if [marked](https://github.com/markedjs/marked) isn't installed yet, install it.

```bash
## for npm
npm install marked

## for yarn
yarn add marked
```

<span class="label warning">Official Doc</span> [Marked Documentation](https://marked.js.org/)

We're going to utilize `lexer` - one of marked functions. It returns all elements of the Markdown content as tokens.

When the Markdown content is passed to `marked.lexer()`, the result would be a token object like the following;

```js
[
  {
    type: 'heading',
    raw: '## Headline Text',
    depth: 2,
    text: 'Headline Text',
    tokens: Array(1)
  },
  {
    type: 'paragraph',
    raw: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod te'
  },
  {
    type: 'heading',
    raw: '### Headline Text',
    depth: 3,
    text: 'Headline Text',
    tokens: Array(1)
  },
  {
    type: 'paragraph',
    raw: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod te'
  },
]
```

As you could now imagine, we can get headings with `type: heading`. Therefore, the steps would be;

1. Pick up headings and put them into an array
2. Create a list of the array with `map()` from 1
3. During 2, modify heading text strings so that the links can work

Then the created list would be used as a Table of Contents.

Why do we need to modify the heading text strings at step 3? It is because the `id`s, generated and pointed to each heading automatically, are the strings already output without spaces or symbols (I'm going to talk about it later).

## Prepare a component for the Table of Contents

So, let us go on to the component for the Table of Contents now.

The ToC component will have a function to make a headings list from the Markdown content as an argument.

On the other hand, the auto-`id` of each heading is regenerated from the heading string; spaces become a hyphen (-), or symbols are omitted.

<div class="filename">Markdown</div>

```md
## Hello World!^.+*{}[]?
```

<div class="filename">HTML</div>

```html
<!-- Result/all symbols except hyphens are omitted -->
<h2 id="hello-world">Hello World!^.+*{}[]?</h2>
```

The symbols being omitted from the Markdown heading's `id`

- brackets () <> {} []
- period .
- plus +
- asterisk *
- slush /
- back slush \
- circumflex ^
- dollar $
- vertical line |
- question ?
- single quotation '
- double quotation "
- colon :
- semicolon ;
- tilde ~
- comma ,
- equal =
- at mark @
- grave accent `
- sharp #
- exclamation !
- percent %
- and &

If I missed any, let me know it🙇‍♀️

Because `marked.lexer()` leaves all the strings as they are, it should be reformated with `replace()` so that it becomes the same as `id`.

### For Next.js

The file name is up to you.

<div class="filename">/components/post-toc.js</div>

```js
import Link from 'next/link'
import { marked } from 'marked'

export default function TableOfContents({ content }) {
  const tokens = marked.lexer(content)
  const headings = tokens.filter((token, i) => token.type === 'heading')

  return (
    <aside>
      <nav>
        <h2>Table of Contents</h2>
        <ul>
          {headings.map((heading, i) => (
            <li key={i} data-depth={heading.depth}>
              <Link
                href={`#${heading.text
                  .replace(/ /g, '-')
                  .replace(/[\/\\^$*+?.()|\[\]{}<>:;"'~,=@`#!%&]/g, '')
                  .toLowerCase()}`}
              >
                <a>{heading.text}</a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
```

### For Gatsby.js

Though I wrote the code like an official Gatsby.js one (an arrow function expression), of course,  a traditional function expression format is also okay. The file name can be any as well.

<div class="filename">/src/components/post-toc.js</div>

```js
import { Link } from "gatsby"
import { marked } from "marked"

const TableOfContents = ({ content }) => {
  const tokens = marked.lexer(content)
  const headings = tokens.filter((token, i) => token.type === "heading")

  return (
    <aside>
      <nav>
        <h2>Table of Contents</h2>
        <ul>
          {headings.map((heading, i) => (
            <li key={i} data-depth={heading.depth}>
              <Link
                to={`#${heading.text
                  .replace(/ /g, "-")
                  .replace(/[\/\\^$*+?.()|\[\]{}<>:;"'~,=@`#!%&]/g, "")
                  .toLowerCase()}`}
              >
                {heading.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default TableOfContents
```

Like [the code I referred](https://chocolat5.com/tips/markdown-blog-nextjs/#%E7%9B%AE%E6%AC%A1%EF%BC%88table-of-contents%EF%BC%89), I added `data-depth` to realize the hierarchies of the list. However, it might be better to generate another `<ul>` if the hierarchy is lower for the SEO purpose (future task).

That's it. Now add the ToC component to the post template, and send the content to it.

```js
<TableOfContent content={your-markdown-content}>
```

## How to omit some of the headings from ToC

If there are too many headings, you might want to omit some lower headings from the Table of Contents.

In that case, add `<!-- out of toc -->` just before the headings you don't want to show in ToC *the text is up to you.

```md
<!-- out of toc -->
## Heading Text

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod te
```

Then, when generating the constant `headings` array, add a condition that "pick up the `heading` which doesn't follow `<!-- out of toc -->` ahead".

<div class="filename">/components/post-toc.js</div>

```js
const headings = tokens.filter((token, i) => token.type === 'heading'
  && tokens[i-1].text !== '\x3C!-- out of toc -->\n' {/* <- this */}
)
```

Because the bracket (or I should call it "less than") `<` must be escaped inside javascript, it is `\x3C` of ASCII code here.

## Comparison to Markdown All in One (VS Code plugin)

[Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one), a VS Code plugin, also has a function of auto Table of Contents insert.

To compare with this ToC Component, I could say it's very different because ToC generated by this plugin would be included in the Markdown content itself.

For example, if you insert the ToC by the plugin on the very top of the Markdown content, its first sentences are the ToC.

Plus, the links to the heading are sometimes broken.

If you are interested in, try it because it's free. I tried it, then uninstalled it later😅