---
title: Gatsbyのヘビーユーザーが、Gatsbyの素晴らしき点を語る
tags:
  - gatsbyjs
  - nextjs
  - react
date: 2023-08-16
lastmod: 2023-08-16
draft: false
---

私はこれまで、ウェブサイト制作でいくつかのフレームワークを触ってきました。そして最終的にGatsbyに出戻りしました。残念ながら近年、Gatsbyの人気は下降の一途を辿っていますが、人気がないという理由だけで試さないのは非常に勿体ないです。

Gatsbyには他のフレームワークにはない、たくさんの特長を持っています。人気下落にめげず、Gatsbyには頑張っていただきたい！

というわけで、この記事ではGatsbyヘビーユーザーの私が感じる、Gatsbyの素晴らしき点（と、いくつかのそうでもない点）を語りたいと思います。

なお、私がこれまで触ったフレームワークは、以下の通りです。基本的にウェブサイト制作が目的です。

- Gatsby
- Next.js（App Routerについていけてない）
- Astro
- 11ty（かじったレベル）
- Svelte/SvelteKit（かじったレベル）

## Gatsbyのここが素晴らしい

### さまざまな場所にあるデータも1つのGraphQLに統合できる

Gatsbyのもっとも強力な機能、それは**GraphQLによるデータ統合機能**。まったく異なる場所にあるどんなデータも、GraphQLの任意のスキーマに追加してデータの一元管理ができます。

<blockquote class="twitter-tweet" data-theme="dark"><p lang="ja" dir="ltr">I&#39;m so impressed by Qwik, Remix, Next, etc, and would love to use them. But no one has solved the data layer as well as <a href="https://twitter.com/GatsbyJS?ref_src=twsrc%5Etfw">@GatsbyJS</a>. There&#39;s not even any competition. To be able to glue together APIs and make sense of them altogether is incredibly powerful.</p>&mdash; David Paulsson (@davidpaulsson) <a href="https://twitter.com/davidpaulsson/status/1653797711810797569?ref_src=twsrc%5Etfw">May 3, 2023</a></blockquote>

*拙訳：Qwik、Remix、Nextなども素晴らしいし喜んで使う。でもGatsbyほどにデータレイヤーを解決できるフレームワークは他にない。競合すら存在しない。複数のAPIをすべて紐付けて総合的にまとめられる、これはありえないほどに強力な機能だ。*

たとえば、以下のようにサイトのデータを管理しているとします。

- 記事はCMS
- コメントはFirebase
- 閲覧データはGoogle Analytics

従来のRESTでは、それぞれのAPIに接続し、各テンプレート内ですべての情報の中からスラッグなりの条件で必要な情報を1つずつ絞り込んでいました。

一方、Gatsbyでは`gatsby-node.js`で各APIへの接続を行いつつ、既存のGraphQLのスキーマにそれらを追加して1つにまとめられます。GraphQLではソート（並べ替え）や絞り込みも簡単なので、「人気記事順に、記事タイトルとコメント数を10件だけ取得」といったことも一瞬でできるわけです。

以下の記事が、RESTとGraphQLの違いについて詳しく解説しています。

リンク - [GraphQLとRESTの比較─知っておきたい両者の違い | kinsta.com](https://kinsta.com/jp/blog/graphql-vs-rest/)

![GatsbyのGraphQL](../../../images/gatsby-graphql01.png "Umamiアナリティクスから閲覧数のPageViewスキーマを生成し、Markdownの記事データを紐付けた例")

統合可能なデータはAPIのみにとどまりません。プロジェクト内のxlsx・yaml・jsonなどのファイルも、共通の値（スラッグなど）さえあればデータを紐付けられます。

このデータ統合機能は、**他のフレームワークにはない唯一無二の強力な機能**です。

### GraphQLそのものが便利

そのGraphQL自体も、RESTと比較してデータの加工が非常に楽です。

RESTではそれだけではソート（並べ替え）や絞り込みはできないため、そのための関数を自分で用意する必要があります。一方、GraphQLには最初からその機能が備わっています。

下書きの正負やタグによる絞り込み、日付による降順・昇順のソート（並べ替え）など、テンプレートごとに必要な情報をピンポイントで取得できるので、構築が早くできます。

### Reactベースである

GatsbyはReactベースのフレームワークです。そのため、Reactの潤沢なエコシステムの恩恵を受けることができます。この長所はNext.jsにも当てはまります。

近年はReactの短所を補うようなSolid.jsやSvelteなどのフレームワークが誕生し、Reactよりも人気度を上げている調査結果も出ていますが、エコシステムはまだ大きくはありません。

一方Reactは開発人口が多く、FontAwesomeやSwiperなどのおなじみのプラグインから個人開発の小さなサービスまで、それぞれが公式のReact用コンポーネントやモジュールをリリースしています。何かの機能を外部から追加したい時に、悩むことはまずありません。

また、ReactはFacebookの米Meta社が開発している点も大きいです。開発人口が多いNext.js（米Vercel社）も、そのReactに乗っかっています。開発・保守の基板がしっかりしているため、Reactがすぐになくなる心配はないと言っていいでしょう。

### 強力な画像プラグイン

Gatsbyには、非常に優れた画像最適化プラグイン[gatsby-plugin-image](https://www.gatsbyjs.com/plugins/gatsby-plugin-image/)があります。

このブログにも[gatsby-remark-images](https://www.gatsbyjs.com/plugins/gatsby-remark-images/)と共に導入していますが、これだけで記事内の画像をblur（ブラー効果）等を加えた上でsrcsetで画面サイズ別に出力してくれます。

Next.jsにも[next/image](https://nextjs.org/docs/pages/api-reference/components/image)という似たプラグインがありますが、これは画像コンポーネントのみのため、記事内の画像には自動で適用されません。記事内の画像を最適化したい場合は、記事の全文を取得して画像の部分を置換するコードを自前で用意する必要があります。

## Gatsbyの素晴らしくない点

### Netlifyに買収されてから微妙？

2023年6月、GatsbyはNetlifyに買収されました。その後、多くのエンジニアがNetlifyに解雇されました。GatsbyのGitHubディスカッションで、たくさんの開発者（私も含む）を助けてきた[Lennart](https://twitter.com/lekoarts_de)さんもその一人です。

また、Gatsby自体もその2023年6月15日にv5.11.0をリリースしてから、2か月以上新しいバージョンがリリースされていません。買収の混乱が続いているのでしょうか・・・。

### 立ち上がりが遅い

Next.jsやAstro、Svelte（SvelteKit）と比べて、開発環境の立ち上げ（gatsby develop）は明らかに遅いです。サイト規模が大きいほど、メモリが貧弱なPCでは立ち上がりが重くなります。

ビルドについては、他のフレームワークにおいてもかかる時間は画像生成の数によると思うので、そんなに変わらないとは思います。参考までに、Gatsbyで作った当ブログの、Cloudflare Pagesでのビルドタイムは3分弱です。

### 学習コストについて

私は[UdemyのReact50時間講座](https://www.udemy.com/course/react-the-complete-guide-incl-redux/)を修了してみて、「Next.jsは素のReactが持つSEOやルーティングなどの欠点をカバーしつつ使いやすく設計されている」という印象を強くしました。

それに比べると、確かにGatsbyは非常にクセがあります。この記事の最初に「さまざまな場所にあるデータも1つのGraphQLに統合できる」と書きましたが、そのためにはGatsbyの独自の関数を理解しなければいけません。

GraphQLをAPIとして使うことに戸惑う方もまだ多いかもしれません。とは言え、フロントエンドでのGraphQLはRESTと同様にデータを取得するだけなので、そこまで難しくはないとは思います。

これらのハードルさえ越えられれば後はReactなので、Reactを触ったことがあれば問題なく構築できるはずです。

## まとめ

Next.jsが超高機能で複雑になってきた今こそ、Reactが書けるウェブサイト制作者の皆さんはGatsbyを使ってみてはいかがでしょうか。

私はGatsbyヘビーユーザーと言っても、最新のSlice機能やファイルベース・ルーティングなどを使いこなしているわけではありません。それでも、Next.jsやAstroを経ても出戻りするほどの魅力が、Gatsbyには大いにあります。

このブログのように、多言語サイトも作れますよ。