---
title: Vercelの新しいOGPイメージ生成ライブラリ@vercel/ogをNext.jsを導入する手順
tags:
  - nextjs
  - seo
date: 2022-10-19T15:00:00.000Z
lastmod: 2022-10-18T04:48:23.276Z
draft: false
---

2022年10月11日に、Vercelが新しいOGPイメージ生成のライブラリをリリースしました。

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Vercel OG Image Generation – a new library for generating dynamic social card images.<a href="https://t.co/mwzw9NKEzA">https://t.co/mwzw9NKEzA</a></p>&mdash; Vercel (@vercel) <a href="https://twitter.com/vercel/status/1579561293069316096?ref_src=twsrc%5Etfw">October 10, 2022</a></blockquote>

以前まであった`vercel/og-image`は、リポジトリを別に用意・デプロイをして画像を生成するもので、準備に時間がかかり使えるようになるまでの作業が繁雑でした。

新しい`@vercel/og`では、プロジェクト内にファイルを1つ追加するだけでできます（要TypeScript）。

今回はローカルで試してみて動きましたので、この`@vercel/og`を使って「動的にタイトルを挿入する」方法を紹介したいと思います。

<span class="label warning">参考</span> [OG Image Generation](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)

動作環境:

- Node.js v16.18.0
- React v18.2.0
- Next.js v12.3.1
- @vercel/og v0.0.18

## @vercel/ogをインストール

`@vercel/og`を使いたいプロジェクトに移動し、`@vercel/og`をインストールします。

```bash
# npmの場合
npm install @vercel/og

# yarnの場合
yarn add @vercel/og
```

## 変換用のAPIを作成

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

<span class="label warning">参考</span> [Dynamic text generated as image - OG Image Example | Vercel Docs](https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples#dynamic-text-generated-as-image)

この状態でプロジェクトを立ち上げ、以下URLにアクセスすると、もう画像ができ上がっています。

```html
http://localhost:3000/api/og/?title={ここにタイトル}
```

これをMeta用コンポーネントなどにそのまま指定すればOK。

```text
<meta
  property="og:image"
  content={`https://example.com/api/og/?title=${title}`}
/>
```

ファイル内のCSSを調整すれば、画像や色なども変更可能な他、Tailwind CSSにも対応。TailWind CSSでのスタイル変更は**プロジェクトにTailwind CSSをインストールしていなくても使える**ので、非常に便利です。

## 参考リンク（公式）

- 概要: [OG Image Generation](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
- フォントの変更: [Using a custom font](https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples#using-a-custom-font)
- TailWind CSS: [Using Tailwind CSS - Experimental](https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples#using-tailwind-css---experimental)
