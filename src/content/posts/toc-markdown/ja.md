---
title: Markdownブログに目次を追加する方法
tags:
  - markdown
  - nextjs
  - gatsbyjs
date: 2022-11-10T01:00:00.208Z
lastmod: 2022-11-10T01:00:00.208Z
draft: false
---

Markdownで書かれたブログに、目次を追加する方法です。

こちらのブログを参考にさせて頂きました。ありがとうございます🙏

<span class="label warning">参考</span> [Next.js + Markdown (marked) で作るブログサイト](https://chocolat5.com/tips/markdown-blog-nextjs/#%E7%9B%AE%E6%AC%A1%EF%BC%88table-of-contents%EF%BC%89)

上記記事のコードを、いくらかアレンジしています。

動作環境：

- Next.js v12.3.1
- marked 4.2.2

## 目次を作る方法の概要

[marked](https://github.com/markedjs/marked)をインストールしていない場合は、インストールしましょう。

```bash
## npmの場合
npm install marked

## yarnの場合
yarn add marked
```

<span class="label warning">公式ドキュメント</span> [Marked Documentation](https://marked.js.org/)

このmarkedの機能の一つ、Markdownの本文の一つ一つをトークンとして生成して出力する`lexer`を使います。

Markdownで書かれたコンテンツを`marked.lexer()`に通すと、以下のようなトークンの配列が取得出来ます。

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

見出しは`type: heading`で取得できるので、

1. 見出しのみを抜き出して配列にしする
2. 1.を`map()`で展開する
3. 展開しつつ、見出しの文字列を整形する

という手順で、目次として利用可能な「見出しのリスト」を作ることが出来ます。

3.で整形する理由は、見出しに半角記号や半角空白が含まれる場合、見出しに付与される`id`が見出しテキストを整形した文字列となるためです（後述）。

## 目次用コンポーネントを作る

ここから目次用のコンポーネントを作ります。

この目次コンポーネントは、「本文を引数として渡し、見出しのみを取り出してリストにする」という働きを持たせます。

一方、先述したように、Markdownファイルから標準で自動出力される`id`は、半角空白がハイフン(-)に変換される他、ハイフン以外の半角記号は全て省略されます。

<div class="filename">Markdown</div>

```md
## ハローワールド！^.+*{}[]?-
```

<div class="filename">HTML</div>

```html
<!-- 出力例/idからハイフン以外の半角記号は省略される -->
<h2 id="ハローワールド！">ハローワールド！^.+*{}[]?</h2>
```

Markdownの見出しidから省略される文字（全て半角）:

- 括弧 () <> {} []
- ピリオド .
- プラス +
- アスタリスク *
- スラッシュ /
- バックスラッシュ \
- サーカムフレックス ^
- ドル $
- 縦線 |
- クエスチョン ?
- シングルクオート '
- ダブルクオート "
- コロン :
- セミコロン ;
- チルダ ~
- カンマ ,
- イコール =
- アットマーク @
- グレイヴ・アクセント `
- シャープ #
- エクスクラメーション !
- パーセント %
- アンド &

見落としがあったらご指摘下さい🙇‍♀️

`marked.lexer()`で得られる見出しの文字列はテキストそのままのため、`replace()`を使って整形し、`id`と同じになるようにします。

### Next.jsの場合

ファイル名は任意です。

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
        <h2>目次</h2>
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

### Gatsby.jsの場合

以下はGatsby.js公式風にアロー関数の表現にしていますが、もちろん`function`でもかまいません。ファイル名はこちらも任意です。

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
        <h2>目次</h2>
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

[参考サイト](https://chocolat5.com/tips/markdown-blog-nextjs/#%E7%9B%AE%E6%AC%A1%EF%BC%88table-of-contents%EF%BC%89)のように`data-depth`でリストの階層をデザインに反映できるようになっていますが、出来れば下位の階層の場合は別に`<ul>`タグで生成したほうがSEO的にはいいかもしれませんね（今後の課題）。

後は、この目次コンポーネントを記事出力テンプレートに追加し、コンテンツ本文を送るだけです。

```js
<TableOfContent content={コンテンツ本文}>
```

## 見出しを除外したい場合

あまりに見出しが多い場合、小見出しだけを除外したい場合もあります。

その場合は、Markdownファイルの、見出しにあたる部分の直前に`<!-- out of toc -->`等と記入するようにします。※テキストは何でもOKです。

```md
<!-- out of toc -->
## Heading Text

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod te
```

更に、先ほど作った目次コンポーネントの見出し配列`headings`生成時に、「直前の要素に`<!-- out of toc -->`がない`heading`だけを抽出」という条件を足します。

<div class="filename">/components/post-toc.js</div>

```js
const headings = tokens.filter((token, i) => token.type === 'heading'
  && tokens[i-1].text !== '\x3C!-- out of toc -->\n' {/* <- これ */}
)
```

左カッコの文字`<`はjavascript内ではエスケープする必要があるため、ASCIIコードの`\x3C`に変換しています。

## VS Codeプラグイン Markdown All in One との比較

VS Codeのプラグインの [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) にも、Markdownファイルの見出しを抽出して自動で見出しを挿入してくれる機能があります。

今回のコンポーネントと比較した場合、「Markdown All in One」プラグインでは、**目次が本文に含まれる**という点で大きく異なります。

例えば、本文の最初に目次が含まれる場合、記事一覧で見出し文を抽出する場合に、目次が文章の一部として出てきてしまいます。

また、見出しに記号が含まれる場合のリンクの生成に、やや難が感じられました。

プラグインで気軽に使えますので、興味のある方は試してみてください。私は試用してみてイマイチだったので止めました😅