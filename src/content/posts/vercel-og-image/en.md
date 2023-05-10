---
title: Integration of @vercel/og - a new library to generate OG image
tags:
  - nextjs
  - seo
date: 2022-10-19T15:00:00.000Z
lastmod: 2022-10-27T05:52:27.485Z
draft: false
---

On October 11, 2022, Vercel launched a new library of OG image generators.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Vercel OG Image Generation – a new library for generating dynamic social card images.<a href="https://t.co/mwzw9NKEzA">https://t.co/mwzw9NKEzA</a></p>&mdash; Vercel (@vercel) <a href="https://twitter.com/vercel/status/1579561293069316096?ref_src=twsrc%5Etfw">October 10, 2022</a></blockquote>

Their former generator, `vercel/og-image` is still available. But it requires a repository and a deployment apart from the project, which is a bit cumbersome until it works appropriately.

The newly released `@vercel/og` is much simpler; you just add a file inside the project (Typescript is needed).

I've tried it on local and it worked well. So, I'd like to write how to insert a dynamic title to `@vercel/og` in this entry.

<span class="label warning">Reference</span> [OG Image Generation](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)

Environnement de fonctionnement :

- Node.js v16.18.0
- React v18.2.0
- Next.js v12.3.1
- @vercel/og v0.0.18

## Install @vercel/og

Go to the project where you want to use `@vercel/og`, and install it.

```bash
# for npm
npm install @vercel/og

# for yarn
yarn add @vercel/og
```

## Generate API to convert

<div class="filename">/pages/api/og.tsx</div>

```js
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'experimental-edge',
};

export default function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // ?title=<title>
    const hasTitle = searchParams.has('title');
    const title = hasTitle
      ? searchParams.get('title')?.slice(0, 100)
      : 'My default title';

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: 'black',
            backgroundSize: '150px 150px',
            height: '100%',
            width: '100%',
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            flexWrap: 'nowrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              justifyItems: 'center',
            }}
          >
            <img
              alt="Vercel"
              height={200}
              src="data:image/svg+xml,%3Csvg width='116' height='100' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M57.5 0L115 100H0L57.5 0z' /%3E%3C/svg%3E"
              style={{ margin: '0 30px' }}
              width={232}
            />
          </div>
          <div
            style={{
              fontSize: 60,
              fontStyle: 'normal',
              letterSpacing: '-0.025em',
              color: 'white',
              marginTop: 30,
              padding: '0 120px',
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
            }}
          >
            {title}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
```

<span class="label warning">Reference</span> [Dynamic text generated as image - OG Image Example | Vercel Docs](https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples#dynamic-text-generated-as-image)

That's it! Run `yarn dev`, then go to the following URL. You'll see the OG image.

```html
http://localhost:3000/api/og/?title={title_here}
```

Just point to the URL as the `content` of the meta property.

```text
<meta
  property="og:image"
  content={`https://example.com/api/og/?title=${title}`}
/>
```

You can change the style on editing the CSS in `og.tsx`, or Tailwind CSS can be used. **You don't have to install Tailwind CSS** just for it, which is cool!

## Official guidances

- General: [OG Image Generation](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
- Custom font: [Using a custom font](https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples#using-a-custom-font)
- TailWind CSS: [Using Tailwind CSS - Experimental](https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples#using-tailwind-css---experimental)
