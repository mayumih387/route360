---
title: Astro v3のMarkdown内の画像に、<figcaption>でキャプションを追加する
tags:
  - astro
date: 2023-09-04
lastmod: 2023-09-04
---

Astroは2023年8月30日にバージョン3がリリースされ、画像の取り扱いが大きく変わりました。

バージョン2までは「public」フォルダーに保存していた画像を、バージョン3では「src/assets」フォルダーに入れることで、Markdownに挿入された画像も自動で最適化されるようになります。

（あの程度のコンバートを「最適化」と呼んでいいものかどうかはまた別として・・・）

これまでと同様、このままでは単に`<img>`タグで出力され、キャプションがまったく表示されないため、変換コードを作りました。

ざっくりと言えば、HTML出力を編集する[Cheerio](https://cheerio.js.org/)を利用して変換します。また、キャプションとして使うのは`title`要素とします。

動作環境：

- Astro v3.0.7
- Cheerio v1.0.0-rc.12

## 概要

1. Cheerioをインストール
2. CheerioにオリジナルのHTMLを代入
3. `<img>`タグを検知して、`title`がある場合は`<figure>`タグに変換して`<figcaption>`を挿入
4. ついでに`<img>`タグをラップしていた`<p>`タグを外す

Markdownでは以下のように画像をコーディングしていることとします。

```md
![ここはalt要素です](assets/example.jpg "これがtitle要素=キャプションです")
```

## Cheerioをインストール

Cheerioをプロジェクトにインストールします。

```bash
# npm
npm install cheerio

# yarn
yarn add cheerio
```

## コード

### 変換用スクリプトコンポーネント

componentsフォルダーに、convertHtml.jsを作成。

<div class="filename">src/components/convertHtml.js</div>

```js
import * as cheerio from "cheerio"

export default function convertHtml(html) {
  const $ = cheerio.load(html)
  $("img")
    .unwrap() // Pタグを削除
    .replaceWith((i, e) => {
      const { src, alt, title, width, height } = e.attribs
      // titleがある場合
      if (title)
        return `<figure>
          <img
            src="${src}"
            alt="${alt}" 
            loading="lazy"
            title="${title}"
            width="${width}"
            height="${height}"
            decoding="auto"
           />
          <figcaption>${title}</figcaption>
          </figure>`
      // titleがない場合
      return `<img
          src="${src}"
          alt="${alt}"
          loading="lazy"
          width="${width}"
          height="${height}" 
          decoding="auto"
          />`
    })

  return $.html()
}
```

ここでの`decoding`と`loading`要素は、私の好みでそれぞれ`auto`・`lazy`としていますが、お好みの値を代入してください。

### Markdown用レイアウトコンポーネントの編集

レイアウト用のコンポーネントで上記の変換用関数をインポートして、Markdownコンテンツを表示する部分を`<slot />`から以下のコードに変更します。

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

以上です。
