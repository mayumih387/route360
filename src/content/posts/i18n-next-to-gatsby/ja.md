---
title: 多言語ブログをNext.jsからGatsby.jsに変更。理由や設計の概要など
tags:
  - gatsbyjs
  - jamstack
  - internationalization
date: 2023-05-10T15:00:00.000Z
lastmod: 2023-05-26T02:58:54.163Z
draft: false
---

当ブログ（route360.dev）を、開設当初のNext.jsからGatsby.jsで作り替えました。※[こちらでリポジトリを公開](https://github.com/mayumih387/route360)しています。

移行の理由としては、有り体に言えば「私がGatsby.jsのほうにより慣れ親しんでいる」からです。

## Next.jsで作った多言語ブログの概要と問題点

2022年10月のブログ開設当初、以下の設計で作成しました。

- Next.js v12
- 多言語（3カ国語）※現在も同様
- ホスティングはVercel　※現在はCloudflare Pages

Next.jsは2022年秋にバージョン13となり、非常に大きなアップデートが導入されました。2023年3月にはApp Routerの多言語化にも対応されましたが、バージョンアップへの対応に難儀しました。

<blockquote class="twitter-tweet" data-theme="dark"><p lang="en" dir="ltr">Internationalization, too!<br><br>Even basic i18n support can be handled since the App Router&#39;s improved support for handling layouts means you can create static i18n routes that don&#39;t read the dynamic `Accept-Language` header.<a href="https://t.co/vc5zt9K9hk">https://t.co/vc5zt9K9hk</a></p>&mdash; Lee Robinson (@leeerob) <a href="https://twitter.com/leeerob/status/1640445087024029696?ref_src=twsrc%5Etfw">March 27, 2023</a></blockquote>

一言語のみのサイトであればそうでもないはずですが、こと多言語となると、サイト制作の難易度は途端に跳ね上がります。

また、Next.jsは素のReactをより使いやすくするために設計されている印象で、どちらかと言うとフルスタックアプリ向けの傾向が強いです。※個人の感想

一方で、私自身がGatsby v5への対応等で経験値も貯まってきたため、開設当初は難しいと感じていたGatsby.jsでの多言語ブログにチャレンジした次第です。

## Gatsby.jsに乗り換えることで期待できるメリット

自分がかなりGatsby.jsに慣れているということもありますが、Gatsby.js採用では以下のメリットが期待できました。

- GraphQLで、どんなデータも紐付け・必要なものだけ取得ができる（API不要）
- GraphQLで、言語のフィルタリングが容易になる
- 強力な画像最適化プラグイン、gatsby-plugin-imageが使える（next/imageよりも好き）

中でも、GraphQLは、Gatsby.jsの大きなアドバンテージです。

Markdownのコンテンツとjsonファイルを共通のslugで紐付ける、条件に合致したコンテンツのみを抽出（フィルタリング）・並べ替え（ソート）するといったことが、APIでデータを引っ張ってくる場合よりもずっと簡単にできます。

## Gatsby.jsに乗り換えることによるデメリット・注意点

逆に、Gatsby.jsで多言語サイトを運営することによるデメリットは、以下の通りです。

- 学習コストが高いと言われている（私は慣れているのでわからない・・・）
- プラグインの挙動がブラックボックスと言われている
- 立ち上がり（gatsby develop）・ビルド（gatsby build）が遅い
- @vercel/ogが使えなくなる

とくに、Next.jsではGatsby.jsのようなプラグインのエコシステムがない分、Markdownの整形やfeedの生成に一般のNodeパッケージを利用して、自分でこねこねする必要があります。作業は増えますが「自分でコントロールできる」という、エンジニアとしてのある種の安心感に繋がっていました。

対してGatsby.jsでは、それらの作業はプラグインでさくっとやってしまえるため、「ブラックボックス」などと揶揄される一因ともなっています。細かな設定やオプションの調整ができるプラグインも存在しますが、ある程度の制限を感じることもあるかもしれません。

また、多言語サイト特有の設定の違いとしては、以下が挙げられます。

|                                    | Next.js                      | Gatsby.js    |
| ---------------------------------- | ---------------------------- | ------------ |
| ドメイン                           | sub-pathか別ドメインか選べる | sub-pathのみ |
| Markdown内の言語別内部リンク       | 自動                         | 手動         |
| 現在のページの言語（ロケール）取得 | 簡単                         | 手動         |

sub-pathとは、ディレクトリ型の言語別サイト構造のことです。（例：example.com/ja/とexample.com/en/）

また、私は今回、多言語用のプラグインやモジュールを利用していないため、それらを利用した場合には上記の「手動」の部分がもっと簡単になるのかもしれません。

## 多言語ブログのGatsby.jsサイト作成で工夫した点

今回、多言語用のReactパッケージやプラグインといった類いのものは使っていません。`gatsby-node.js`のルーティングのみでパスを生成しています。

その為、以下の設計でこのサイトを作りました。

1. ディレクトリ型の多言語構造にする（例：route360.dev/ja/とroute360.dev/en/）
2. トップページ（route360.dev）にアクセスがあった場合は、英語トップページ（route360.dev/en/）にリダイレクト
3. 各記事は、フォルダーをスラッグ名として、翻訳記事はja.md、en.md等として保存
4. 各記事ページ用に、`gatsby-node.js`では言語別にクエリを生成、`pageContext`に当該言語コードを渡し、現在のページの表示言語判定に使用
5. 翻訳記事があるかどうか、各記事内の`query`から、全記事+スラッグフィルターで判定（翻訳記事がある場合のみ、言語スイッチャーにその言語を表示）
6. 言語別記事一覧ページ用に、`gatsby-node.js`では言語別にクエリを生成、`pageContext`に当該言語コードを渡し、現在のページの表示言語判定に使用
7. RSSフィードは言語別
8. 日付は各国語の表記に合わせる

気になる方は[リポジトリを公開しています](https://github.com/mayumih387/route360)ので、構成を見てみてください。

別途、これらの詳細を記事にしたいと思います。

## まとめ

### Gatsby.jsで多言語ブログを作り替えた結果と感想

[Astroでの多言語サイト作成](/ja/post/astro-i18n/)時は、ファイルの置き場所でルーティングが完結するため言語別にフォルダーを作っていましたが、Gatsby.jsは`gatsby-node.js`のお陰で、ルーティングの自由さを感じました。

また、Next.jsで作った旧サイトでは、翻訳記事がない場合もリンクやヘッダーへのメタデータを表示してしまっていました。それがGatsby.jsではGraphQLのおかげでフィルタリングが容易になり、翻訳記事がない場合はそれらを表示しないようにできました（単なる技術の問題）。

そのため、「翻訳を待たずに日本語版だけ先に公開」といったこともできるようになりました。

### 今後の展望と改善点

#### TypeScript化は必要？

現時点では必要性を感じておらず、このGatsbyサイトにはTypeScriptを導入していません。今後、やる気が出れば勉強のために書き換えチャレンジするかも？

#### 自動OGP画像

GitHubのような、自動OGP画像機能も入れられていません。ぼちぼちできればいいなと。
