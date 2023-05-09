---
title: Astroで多言語サイト（i18n）を作ってみた感想
tags:
  - astro
  - internationalization
date: 2022-12-17T03:00:00.000Z
lastmod: 2023-02-24T04:20:40.144Z
draft: false
---

遙か昔に知人と作ったWordPressの多言語サイトを、Astroの勉強を兼ねてリニューアルさせました。

こちら👉[Visit Palestine](https://visit-palestine.net/ja/)

※掲載情報そのものは非常に古いので、内容は参考程度にご笑覧下さい。

Astroは、公式では大々的に多言語対応を謳ってはいないものの、ディレクトリ構造とファイルの置き場所がそのままURLとして生成されるため、ディレクトリ型かつMarkdownの多言語サイトであれば、比較的簡単に作成にチャレンジできます。

Astroの[公式ドキュメント](https://docs.astro.build/en/getting-started/)も、ディレクトリ型での多言語対応です。

一方、公式による完全対応ではないため、苦労した部分もありました。

私はNext.jsでの多言語サイト（当サイトroute360.dev）の作成経験があるので、主にそれとの比較になります。

動作環境

- astro v.2.0.15

## Astroについてのざっくり感想

Astroでのサイト作成は初めてでしたが、Next.jsやGatsbyを使っていた自分としては、コンポーネントベースであり、React導入も出来るので非常に使いやすかったです。

設計者の方も恐らくこれらのフレームワーク（主にNext.js？）を使っていて、不満な部分を改善しながらAstroを設計しているのではないかと感じます。

一方で、画像生成については便利なnext/imageやgatsby-plugin-imageに比べると、最適化の点において少し苦労しました（現時点でも完全に最適化出来ているとは言えませんが）。

### 11thも試してみたけれど・・・

尚、[11ty](https://www.11ty.dev/)でもサイトリニューアルが出来ないかと試行錯誤しました。

11tyは2022年11月のJamstack Confで「静的サイトなら11ty！」と激推しされていたこともあり、実はAstroよりも先に試していた次第。

<iframe width="560" height="315" src="https://www.youtube.com/embed/AMCn7FwrUV0?start=1599" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

11tyはv2.0以降で公式プラグインによりi18nに対応（予定）。言語によるフィルタリング等が出来ます。

ただ、私自身がそれ以前に11tyの言語であるNunjucksを全く触ったことがなく、条件分岐などで学習の必要性を感じたため、試しにAstroで作ったら思いのほか楽に出来た、という感じです。

Nunjucksに慣れさえすれば、11tyでも多言語サイトは作りやすそうです。

## Astroの多言語サイト作成でやったことなど

### 現在の表示言語の取得

Astroの[公式ドキュメント](https://docs.astro.build/en/getting-started/)の場合、URLから現在の表示言語を取得しています。

<span class="label warning">参考</span> [util.ts | withastro/docs - GitHub](https://github.com/withastro/docs/blob/main/src/util.ts)

<div class="filename">/src/util.ts</div>

```ts
export function getLanguageFromURL(pathname: string) {
  const langCodeMatch = pathname.match(/\/([a-z]{2}-?[a-z]{0,2})\//);
  return langCodeMatch ? langCodeMatch[1] : 'en';
}
```

これを参考に、今回制作したサイト（[visit-palestine.net](https://visit-palestine.net/ja/)）でもほぼ同様にしました。

別の方法としては、Markdownであればfront matterに`lang`属性を付与して判定したり、CMSであればAPIやGraphQLから言語を取得することも出来るかと思います。

### 言語スイッチャー（言語セレクター）

言語スイッチャーって本当に必要？と思いながらも、いつもつけてしまうアレです。

公式では、言語スイッチャー（セレクター）はjavascriptで実装されています。

<span class="label warning">参考</span> [LanguageSelect.tsx | withastro/docs  - GitHub](https://github.com/withastro/docs/blob/main/src/components/Header/LanguageSelect.tsx)

<div class="filename">/src/components/Header/LanguageSelect.tsx</div>

```js
<select
  className="header-button language-select"
  value={lang}
  aria-label="Select language"
  onChange={(e) => {
    const newLang = e.target.value;
    const [_leadingSlash, _oldLang, ...rest] = window.location.pathname.split('/');
    const slug = rest.join('/');
    window.location.pathname = `/${newLang}/${slug}`;
  }}
>
```

今回のサイト（[visit-palestine.net](https://visit-palestine.net/ja/)）では、現在のパスからスラッグを取得し、格好良くはないと思いつつも二カ国語だけなのでハードコーディング。

```js
---
const currentPath = Astro.url.pathname
const slug = currentPath === '/404/' ? '' : String(currentPath).substring(4)
---

...

<ul>
  <li><a href={`/en/${slug}`}>English</a></li>
  <li><a href={`/ja/${slug}`}>日本語</a></li>
</ul>

```

### 言語別404ページの振り分け

Astroでは、`page`フォルダ直下に`404.astro`または`404.md`を配置することで、カスタム404ページを生成出来ます。

[公式ドキュメント](https://docs.astro.build/en/getting-started/)の構造をGitHubで確認すると、言語別の404ページの表示は、以下のように設定されています。

1. `/page/404.astro`を作成
2. `/page/[lang]/404.astro`を作成して`/page/404.astro`で読み込む
3. ビルド時にそれぞれの言語毎に404.htmlを生成
4. Netlifyのリダイレクト機能を使い、`/[lang]/*`アクセス時に`/[lang]/404.html`を表示させる。ただし、`/*`（非言語別ディレクトリ下）アクセス時は、英語版を表示

鬼門は4のNetlifyでした。私はCloudflare Pagesを使いたかった・・・そう、Cloudflare Pagesのredirects機能では、2022年12月時点ではまだ、404表示ページのリダイレクト設定が出来ません。

<span class="label warning">参考</span> [Redirects · Cloudflare Pages docs](https://developers.cloudflare.com/pages/platform/redirects/)

Netlifyは日本では表示速度が遅いので積極的には使いたくないし、firebase hostingも専用CLIで面倒だし・・・

### サイトマップ生成

Astroでは、公式のサイトマップ生成プラグイン[@astrojs/sitemap](https://docs.astro.build/ja/guides/integrations-guide/sitemap/)が用意されています。

このプラグインは国際化（i18n）サイトにも対応されています。私は試していません。

今回作ったサイトはブログではなく、ページ増設の予定は現時点ではないことから、サイトマップ自動生成サイトで公開URLを収集して、置換や変換を利用して手動で作りアップしました。

## Astroの多言語サイト作成で苦労しそうなこと

今回のサイト（[visit-palestine.net](https://visit-palestine.net/ja/)）では試していませんが、別のサイトを作る場合に難しかったり対応が必要になるであろう点を挙げてみます。

### ドメイン型での言語ページ作成

例：example.comとexample.jp、en.example.comとja.example.comなど

Next.jsではサブドメイン型とディレクトリ型で多言語サイトの生成方法を選択できますが、Astroの場合は基本的にディレクトリ型のみになります。

### フィード生成

Next.jsのフィード生成でも少々苦労しましたが、言語別フィードを作る場合も多少骨が折れそうです。

<span class="label warning">関連エントリー</span> [多言語のMarkdown + Next.jsブログに、言語別のRSSフィード生成機能を追加](/ja/post/rss-feed-multilingual/)

RSSフィードについては、公式のプラグイン[@astrojs/rss](https://docs.astro.build/ja/guides/rss/#setting-up-astrojsrss)が用意されています。

フィード内容や出力先は自由にカスタマイズ出来るため、上記エントリーと同様に言語別フィードを作ることは出来ると思います。

### サブディレクトリには入れない場合のデフォルト言語コンテンツ

Astroは、ディレクトリにファイルを置く場所により、ルーティングが完了します。

そのため、Next.jsの多言語サイト（例えば当サイト[route360.dev](/)）のように、デフォルト言語は言語ディレクトリでURLを生成しない場合、ファイル管理が煩雑になります。

11tyも同じようにフォルダ・ファイルの場所でルーティングをするため、この点ではAstroと共通しています。

## まとめ

Astroはドキュメント自体が多言語であり、GitHub上でそのリポジトリが公開されているため、非常に参考になりました。

言語別にフォルダを作ればいいため、言語を増やすのも難しくはなさそうです。（右から左に書くアラビア語のような言語でなければ・・・）

Astroそのものも、静的サイトを既にNext.js等を作って制作している方であれば、すんなり出来ると思います。

### 参考サイト

- [astro Docs](https://docs.astro.build/ja/getting-started/)
- [withastro / Docs - GitHub](https://github.com/withastro/docs)
- [11ty](https://www.11ty.dev/)