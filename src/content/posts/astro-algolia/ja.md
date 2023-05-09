---
title: Astroで作る静的サイトに、超高速のAlgoliaの検索システムを導入する
tags:
  - astro
  - algolia
date: 2023-02-15T10:00:00.000Z
lastmod: 2023-02-15T10:00:00.000Z
draft: false
---

前回、[MeilisearchをAstroに導入しました](/ja/post/astro-meilisearch/)が、日本語の漢字語彙の検索にまだ少し難があるため、[Algolia](https://www.algolia.com/)も試しました。

Algoliaは、ドキュメント数10,000・月10,000サーチまでが無料となっています。個人や小規模のサイトには十分ですが、中規模以上になると料金がかさむというのが巷の評価（？）ですね。

コードの書き方に多少の違いがあるものの、流れ的には、Meilisearchの導入の手順と同じです。

1. Algoliaにユーザー登録
2. Astroプロジェクト内にalgoliasearchをインストール
3. 検索用のデータを構築してAlgoliaに送信
4. 検索フォーム・検索結果表示用コンポーネントを作成
5. ページ内で検索コンポーネントを読み込む
6. スタイリング

動作環境:

- Node v18.12.1
- Astro v2.0.11
- algoliasearch v4.14.3
- dotenv v16.0.3

尚、今回の例で利用するAlgoliaのライブラリは、Javascriptだけで動く「InstantSearch.js v4」です。

<span class="label warning">リンク</span> [What is InstantSearch.js? | Algolia](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/)

今回は試していませんが、Algoliaには、React用・Vue用ライブラリ等もあります。

## Astroプロジェクトの構造

今回は、以下の構造でAstroサイトを作ることとします。

```text
├ src/
│  ├ pages/
│  │  └ ...
│  └ posts/
│    ├ first-post.md
│    ├ second-post.md 
│    └ ...
```

更に、MarkdownのデータのYAML frontmatterは以下ようにしています。

<div class="filename">src/posts/first-post.md</div>

```md
---
title: My first post
slug: first-post
---

dignissimos aperiam dolorem qui eum facilis quibusdam animi sint suscipit qui sint possimus cum quaerat magni maiores excepturi ipsam ut commodi dolor voluptatum modi aut vitae
```

## Algoliaに登録

セルフホストも可能なMeilisearchと違い、Algoliaはクラウド版のみです。

[トップページ](https://www.algolia.com/)の「START FREE」から登録を進めましょう。

![Algoliaの登録ページ](../../../images/algolia01.en.png '&copy; Algolia')

確認メールで認証リンクを押せば登録完了です。

### Algolia上でアプリケーションの作成

最初にログインをすると、アプリケーションのセットアップ画面に自動で移動します。

アプリケーション内に「インデックス（箱）」を作り、その中に検索データとなる「レコード（リスト）」を入れる仕組みです。

インデックス名は今回、「dev_posts」としました。テスト用、本番用として、インデックス名の頭に「dev_」「prod_」等で分けることが推奨されています。

![Algoliaのアプリ作成画面](../../../images/algolia06.png '&copy; Algolia')

インデックス作成が完了したら、セッティング画面へ行き、アプリケーション名を変更しておきましょう。

![Algoliaのアプリ作成画面](../../../images/algolia07.png '&copy; Algolia')

![Algoliaのユーザー設定画面](../../../images/algolia08.png '&copy; Algolia')

![Algoliaのアプリ名変更画面](../../../images/algolia09.png '&copy; Algolia')

### レコード編集用のAPI keyの作成

Algoliaは、クラウド上でレコードを手動追加したり、JSONファイルなどをアップロードすることでレコードを追加出来ますが、今回はリモートでレコードを追加します。

そのため、**リモートで編集可能なAPI KEYが必要**となります。マスターキーでも操作可能ですが、セキュリティのため書き換え専用のAPIキーを作ります。

先ほどの「API KEYS」の画面から、「All API keys」タブを開き、「New API key」ボタンをクリック。

![Algoliaのキー作成画面](../../../images/algolia12.png '&copy; Algolia')

先ほど作成したインデックス（今回の例では「dev_posts」）を指定し、一番下の「ACL」で、

- addObject
- deleteObject

を選択。

![Algoliaのキー作成画面](../../../images/algolia13.png '&copy; Algolia')

「Create」で作成したら、API keyを控えておきます。

## Astroにalgoliasearchとdotenvをインストール

ここからはAstroプロジェクトでの作業です。

AstroでAlgoliaを利用するために、プロジェクト内に[algoliasearch](https://www.npmjs.com/package/algoliasearch)をインストールします。

```bash
# npmの場合
npm install algoliasearch

# yarnの場合
yarn add algoliasearch
```

更に、環境変数をjsファイル内で扱うため、[dotenv](https://www.npmjs.com/package/dotenv)をインストールします。

```bash
# npmの場合
npm install dotenv

# yarnの場合
yarn add dotenv
```

## 検索用データの構築

次に、検索データを構築・送信するため、ファイルを作成します。

- libフォルダ内に、`algoliasearch.js`（ファイル名、ファイルの場所は任意）
- ルート直下に`.env`

```text
├ src/
├  ├ pages/
├  │  └ ...
├  ├ posts/
├  │  ├ first-post.md
├  │  ├ second-post.md 
├  │  └ ...
├  └ lib/
├    └ algoliasearch.js <--これと
├ .env <--これ
```

### .envファイルの編集

.envファイルに、以下の環境変数を入れておきます。

<div class="filename">.env</div>

```bash
ALGOLIA_APP_ID=xxxxxxxxxx
ALGOLIA_SEARCH_ONLY_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ALGOLIA_WRITE_API_KEY=xxxxxxxxxxxx
```

`ALGOLIA_WRITE_API_KEY`は、先ほど作成したAPI keyです。その他のデータは、ホームボタン（Overview）→「API keys」で確認可能。

![Algoliaホーム画面](../../../images/algolia10.png '&copy; Algolia')

![AlgoliaのAPI KEYS画面](../../../images/algolia11.png '&copy; Algolia')

### algolia.jsの作成

次に、Algoliaに作った「インデックス」に入れるデータ「レコード」を送るためのJavascriptファイルを作成します。

#### 基本形

Alogoliaにデータを送信するためのコードの基本形は、こんな感じです。

```js
import algoliasearch from 'algoliasearch'
const client = algoliasearch(
  'アプリID',
  '編集用APIキー'
)

client
  .initIndex('インデックス名')
  .saveObjects('JSONデータ')
  // .then((res) => console.log(res))
```

[Meilisearchの時](/ja/post/astro-meilisearch/)とほぼ同じです。「JSONデータ」の部分に、必要なデータを投稿から集めてAlgoliaに送信します。

#### dotenvをインポート

`algolia.js`のファイル冒頭で、dotenvを有効にします。

<div class="filename">src/lib/algolia.js</div>

```js
import * as dotenv from 'dotenv'
dotenv.config()

// 続く
```

#### 送信部分を記述

続いて、骨格部分を追加。

<div class="filename">src/lib/algolia.js</div>

```js
// 続き

import algoliasearch from 'algoliasearch'
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_WRITE_API_KEY
)

// 1. ここでレコードを作る（後述）

// 2. JSONデータを作ってから送信
client
  .initIndex('dev_posts')
  .saveObjects('JSONデータ')
  .then((res) => console.log(res)) //送信結果表示用
```

#### 検索用データセットの作成

次に、検索用のデータセット（records）を作ります。

今回はMarkdownによる投稿を例としています。外部CMSを使っている場合は`fetch()`等でデータを取得するなど、適宜アレンジして下さい。

Markdownのタグを除去するため、[remove-markdown](https://www.npmjs.com/package/remove-markdown)を利用しています。必要な場合はインストールして下さい。

<div class="filename">src/lib/algolia.js</div>

```js
// 続き
// 1. ここでJSONデータを作る
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import removeMd from "remove-markdown"

const filenames = fs.readdirSync(path.join('./src/posts'))
const data = filenames.map((filename) => {
  try {
    const markdownWithMeta = fs.readFileSync('./src/posts/' + filename)
    const { data: frontmatter, content } = matter(markdownWithMeta)
    return {
      objectID: frontmatter.slug,
      slug: frontmatter.slug,
      title: frontmatter.title,
      content: removeMd(content).replace(/\n/g, ""),
    }
  } catch (e) {
    // console.log(e.message)
  }
})

// 2. JSONデータを作ってから送信
// 略
```

ポイントは以下の通り。

- `import.meta.glob()`はここでは動かないため、fs・path・matterを使用（インストール不要）
- `objectID`は必須だが、saveObjects()のオプションで自動生成可能。今回はslugをobjectIDとして利用
- ここでは`content`を使い、全文を取得。`slice()`などを使って短くしても良い

#### 送信データを代入

作った`data`をJSON形式にして、`saveObjects()`に投入。

<div class="filename">src/lib/algolia.js</div>

```js
// 続き

// 2. JSONデータを作ってから送信
client
  .initIndex('dev_posts')
  .saveObjects(JSON.parse(JSON.stringify(data)))
  .then((res) => console.log(res))
```

#### algolia.jsコードまとめ

<div class="filename">src/lib/algolia.js</div>

```js
import * as dotenv from 'dotenv'
dotenv.config()

import algoliasearch from 'algoliasearch'
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_WRITE_API_KEY
)

// 1. ここでJSONデータを作る
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import removeMd from "remove-markdown"

const filenames = fs.readdirSync(path.join('./src/posts'))
const data = filenames.map((filename) => {
  try {
    const markdownWithMeta = fs.readFileSync('./src/posts/' + filename)
    const { data: frontmatter, content } = matter(markdownWithMeta)
    return {
      id: frontmatter.slug,
      title: frontmatter.title,
      content: removeMd(content).replace(/\n/g, ""),
    }
  } catch (e) {
    // console.log(e.message)
  }
})

// 2. JSONデータを作ってから送信
client
  .initIndex('dev_posts')
  .saveObjects(JSON.parse(JSON.stringify(data)))
  .then((res) => console.log(res))
```

以上で`algolia.js`は完成です。

## 検索用データ（records）を送信

`algolia.js`ファイルが出来たら、Nodeを使って実行します。

Astroプロジェクトのルートで、以下を実行。※`algolia.js`を違う場所に置いたり他のファイル名にした場合は、その場所とファイル名を指定。

<div class="filename">bash</div>

```bash
node src/lib/algolia.js
```

無事にデータが送信完了すると、ファイル内に記述した`console.log(res)`によって、以下のように表示されます。

<div class="filename">bash</div>

```bash
{
  taskIDs: [ 125508379002 ],
  objectIDs: [ 'third-post', 'second-post', 'first-post' ]
}
```

Algoliaのダッシュボードに移動して、インデックスを確認してみましょう。登録されていますね🙂

![Algoliaのインデックス確認ページ](../../../images/algolia14.png '&copy; Algolia')

## 検索結果を表示するコンポーネントの作成

`src`フォルダ直下の`components`ディレクトリ（なければ作成）下に、検索ボックス+検索結果を表示するコンポーネントを作成。ここではファイル名を「Search.astro」としました。

```text
├ src/
│  ├ components/
│  │  └ Search.astro <--これ
│  ├ pages/
│  │  └ ...
│  ├ posts/
│  │  ├ first-post.md
│  │  ├ second-post.md 
│  │  └ ...
│  └ lib/
│    └ algolia.js
├ .env
```

[AstroにMeilisearchを導入した際](/ja/post/astro-meilisearch/)とほぼ同様に、こんな風にしてみました。

<div class="filename">src/components/Search.astro</div>

```html
<div class="wrapper">
  <div id="searchbox"></div>
  <div id="hits"></div>
</div>

<script
  is:inline
  src="https://cdn.jsdelivr.net/npm/algoliasearch@4.14.2/dist/algoliasearch-lite.umd.js"
  integrity="sha256-dImjLPUsG/6p3+i7gVKBiDM8EemJAhQ0VvkRK2pVsQY="
  crossorigin="anonymous"
></script>
<script
  is:inline
  src="https://cdn.jsdelivr.net/npm/instantsearch.js@4.49.1/dist/instantsearch.production.min.js"
  integrity="sha256-3s8yn/IU/hV+UjoqczP+9xDS1VXIpMf3QYRUi9XoG0Y="
  crossorigin="anonymous"
></script>
<script is:inline>
  const search = instantsearch({
    indexName: 'dev_posts',
    searchClient: algoliasearch(
      import.meta.env.ALGOLIA_APP_ID,
      import.meta.env.ALGOLIA_SEARCH_ONLY_API_KEY
    ),
  })
  search.addWidgets([
    instantsearch.widgets.searchBox({
      container: '#searchbox',
    }),

    instantsearch.widgets.hits({
      container: '#hits',
      templates: {
        item: `
          <a href='/{{#helpers.highlight}}{ "attribute": "slug" }{{/helpers.highlight}}/'>
            <h2 class="hit-name">
              {{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}
            </h2>
            <p>{{#helpers.highlight}}{ "attribute": "content" }{{/helpers.highlight}}...</p>
          </a>
      `,
      },
    }),
  ])
  search.start()
</script>
```

注意⚠️Astroで外部のCDNスクリプトを利用する場合、`is:inline`を使ってコンポーネント内でスクリプトを走らせることになります。そうするとHTML内にスクリプトが挿入されることになり、ページの表示速度が損なわれます。

このコンポーネントを他のコンポーネントやテンプレート内で読み込めばOKです。

表示は以下のようになります。

![Algoliaのフロントエンド検索画面](../../../images/algolia15.png)

モーダル表示用のコンポーネントを作って、その中でこのSearch.astroを読み込んで表示させるのがいいですね。なるべくBodyの閉じタグ直前で読み込むとベター。

## スタイルを適用させる

スタイルの適用方法としては、いくつか選択肢があります。

- クラス名を確認して自分で作る
- reset.cssまたはsatellite.cssを読み込む（npm または CDN）

### クラス名を確認して自分で作る

コンポーネント内に表示されていないクラス名は、`is:global`を使って適用させます。

<div class="filename">src/components/Search.astro</div>

```html
<!-- 続き -->

<style is:global>
  .ais-Hits-item {
    margin-bottom: 1em;
  }
</style>
```

### satellite.cssを読み込む

<span class="label warning">参考</span> [Style your widgets | Algolia](https://www.algolia.com/doc/guides/building-search-ui/widgets/customize-an-existing-widget/js/#style-your-widgets)

#### インストールする場合

<div class="filename">bash</div>

```bash
# npmの場合
npm install instantsearch.css

# yarnの場合
yarn add instantsearch.css
```

<div class="filename">src/components/Search.astro</div>

```js
---
// リセットCSSのみ
import 'instantsearch.css/themes/reset.css'
// または、サテライトテーマ（リセットCSS含む）
import 'instantsearch.css/themes/satellite.css'
---

<div class="wrapper">
  <div id="searchbox"></div>
  <div id="hits"></div>
</div>

// ...
```

#### CDNで読み込む場合

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/instantsearch.css@7.4.5/themes/satellite-min.css"
  integrity="sha256-TehzF/2QvNKhGQrrNpoOb2Ck4iGZ1J/DI4pkd2oUsBc="
  crossorigin="anonymous"
/>
```

#### 表示例

![instantsearch.cssでのAlgolia表示例](../../../images/algolia16.png)

## 日本語用の設定

日本語で利用する場合は、インデックスの設定で日本語がきちんと読み込まれるように設定しておきます。

左メニューの「Search」から、Indexの「Configuration」タブを開き、「Language」に行きます。

「Index Languages」と「Query Languages」に「Japanese」を追加して、保存します。

![Algoliaの日本語設定](../../../images/algolia17.ja.png "&copy; Algolia")

## 補足

AlgoliaはReactやVueのライブラリも提供しているため、Astroにそれらをインストールすれば、もっと作業が楽になるかもしれません。

MeilisearchがAlgoliaとの互換性を考えて作られているため、ひとまずAlgoliaで作っておいて、後で無料プランのレコード数の多いMeilisearchへの移行もスムーズです。

