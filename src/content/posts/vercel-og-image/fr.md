---
title: Intégration de @vercel/og - une nouvelle bibliothèque pour générer l'image OG
tags:
  - nextjs
  - seo
date: 2022-10-19T15:00:00.000Z
lastmod: 2022-10-27T06:44:32.020Z
draft: false
---

Le 11 octobre 2022, Vercel a lancé une nouvelle bibliothèque de générateur d'images OG.

<iframe id="twitter-widget-0" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" class="" style="position: static; visibility: visible; width: 550px; height: 641px; display: block; flex-grow: 1;" title="Twitter Tweet" src="https://platform.twitter.com/embed/Tweet.html?dnt=false&amp;embedId=twitter-widget-0&amp;features=e30%3D&amp;frame=false&amp;hideCard=false&amp;hideThread=false&amp;id=1579561293069316096&amp;lang=en&amp;origin=file%3A%2F%2F%2FC%3A%2FUsers%2Fharab%2FOneDrive%2F%25E3%2583%2589%25E3%2582%25AD%25E3%2583%25A5%25E3%2583%25A1%25E3%2583%25B3%25E3%2583%2588%2FExcelPython%2Ftest.html&amp;theme=light&amp;widgetsVersion=1c23387b1f70c%3A1664388199485&amp;width=550px" data-tweet-id="1579561293069316096"></iframe>

Leur ancien générateur, `vercel/og-image` est encore disponible. Mais il nécessite un dépôt et un déploiement en dehors du projet, ce qui est un peu encombrant jusqu'à ce qu'il fonctionne correctement.

Le nouveau générateur `@vercel/og` est beaucoup plus simple ; vous ajoutez juste un fichier dans le projet (Typescript est nécessaire).

Je l'ai essayé en local et cela a bien fonctionné. Donc, je voudrais écrire dans cette entrée, comment insérer un titre dynamique à `@vercel/og` .

<span class="label warning">Référence</span> [OG Image Generation](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)

Working environment:

- Node.js v16.18.0
- React v18.2.0
- Next.js v12.3.1
- @vercel/og v0.0.18

## Installer @vercel/og

Allez dans le projet où vous voulez utiliser `@vercel/og`, puis installez-le.

```bash
# pour npm
npm install @vercel/og

# pour yarn
yarn add @vercel/og
```

## Générer une API pour convertir

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

<span class="label warning">Référence</span> [Dynamic text generated as image - OG Image Example | Vercel Docs](https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples#dynamic-text-generated-as-image)

C'est tout ! Lancez `yarn dev` puis allez à l'URL suivante. Vous verrez l'image OG.

```html
http://localhost:3000/api/og/?title={title_ici}
```

Il suffit d'indiquer l'URL comme le `contenu` de la propriété méta.

```js
<meta property="og:image" content={`https://example.com/api/og/?title=${title}`} />
```

Vous pouvez changer le style en éditant le CSS dans `og.tsx`, ou vous pouvez utiliser Tailwind CSS. **Vous n'avez pas besoin d'installer Tailwind CSS** pour l'utiliser, ce qui est cool !

## Guides officiels

- Général: [OG Image Generation](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
- Police personnalisée: [Using a custom font](https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples#using-a-custom-font)
- TailWind CSS: [Using Tailwind CSS - Experimental](https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples#using-tailwind-css---experimental)