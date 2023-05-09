---
title: RSS feed pour un blog Markdown multilingue de Next.js
tags:
  - markdown
  - nextjs
  - seo
  - internationalization
date: 2022-12-12T02:54:16.999Z
lastmod: 2022-12-12T03:31:18.524Z
draft: false
---

J'ai enfin réussi l'installation des flux RSS pour ce blog (route360.dev).

Je sais que ce n'est pas compliqué en fait pour un blog monolingue, mais ce blog est écrit en trois langues (anglais, français et japonais). Les flux RSS doivent être générés pour chaque langue, ça peut être un peu plus compliqué.

Pour les codes, le blog suivant m'a beaucoup aidé. Merci🙏

<span class="label warning">Reference</span> [Next.jsにfeedを導入してRSSとAtomのフィードを生成しよう](https://fwywd.com/tech/next-feed-rss-atom)

Mes codes sont arrangés basé sur siens pour le multi-lingue.

Environnement de travail :

- Node.js v16.18.0
- React v18.2.0
- Next.js v12.3.1
- feed v4.2.2
- marked v4.1.1

## L'aperçu

1. Comment optimiser les différentes URL des articles
2. Comment envoyer la liste des messages de chaque langue à la fonction de générateur de flux RSS

1 -> S'il est normal que le titre change en fonction de la langue, les URL changent également ; dans l'URL, pas de code de langue pour la langue par défaut mais d'autres comme `/ja/`. (en cas de [Sub-path Routing](https://nextjs.org/docs/advanced-features/i18n-routing)). Pour gérer ce problème, laissez la fonction de flux recevoir deux arguments - locale et posts - afin qu'elle puisse générer des flux séparément pour chaque langue.

2 -> La liste des articles est déjà générée sur la page d'accueil du blog, que nous pouvons utiliser pour les flux. Insérez la fonction de flux dans `getStaticProps` de la page d'accueil du blog en ajoutant la locale et les posts comme arguments.

## Installer feed

Tout d'abord, installez [feed](https://www.npmjs.com/package/feed), un paquet Node.js.

```bash
## pour npm
npm install feed

## pour yarn
yarn add feed
```

## Créer un composant de fonction de flux RSS

### Les informations de base sur le site web

J'ai préparé les informations de base sur le site Web comme suit ;

```js
const siteTitle = {
  en: "My Great Website!",
  fr: "Mon site web superbe !",
  ja: "私のサイトは素晴らしい！",
}
const siteDesc = {
  en: "This is my finest website ever.",
  fr: "C'est mon site web le plus cool !",
  ja: "これ以上ない素晴らしすぎるサイトです。",
}
const siteUrl = "https://example.com/"
const defaultLocale = "en"
const author = "Tokugawa Ieyasu"
const email = "ieyasu@example.com"
```

Ceci n'est qu'un exemple. En général, les informations de base doivent être stockées dans `/lib/constats.js` ou quelque part, et vous pouvez récupérer ces informations à partir de là.

### Générer les données de base pour les flux RSS

Les informations de base doivent être placées au sommet de la hiérarchie des flux. Créons-la d'abord.

<div class="filename">/lib/feed.js</div>

```js
import { Feed } from 'feed'

export default function GeneratedRssFeed(locale, posts) {
  const siteTitle = {
    en: "My Great Website!",
    fr: "Mon site web superbe !",
    ja: "私のサイトは素晴らしい！",
  }
  const siteDesc = {
    en: "This is my finest website ever.",
    fr: "C'est mon site web le plus cool !",
    ja: "これ以上ない素晴らしすぎるサイトです。",
  }
  const siteUrl = "https://example.com/"
  const defaultLocale = "en" //langue locale par défaut
  const author = "Tokugawa Ieyasu"
  const email = "ieyasu@example.com"

  const feed = new Feed({
    title: `${siteTitle[locale]}`,
    description: siteDesc[locale],
    id: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`,
    link: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`,
    language: locale,
    image: `${siteUrl}image.png`,
    favicon: `${siteUrl}favicon.png`,
    copyright: `Copyright ${siteTitle} All rights reserved`,
    generator: "Feed for Node.js", // option (défaut: https://github.com/jpmonette/feed)
    updated: new Date(), // option (défaut: today)
    feedLinks: {
      json: `${siteUrl}rss/feed.${locale}.json`,
      rss2: `${siteUrl}rss/feed.${locale}.xml`,
      atom: `${siteUrl}rss/feed.${locale}.xml`,
    },
    author: {
      name: author,
      email: email,
      link: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`
    }
  })
}
```

La clé du code ci-dessus est de savoir comment récupérer les données et comment les ramifier en fonction de chaque locale.

Comme la fonction prend la locale comme l'un des deux arguments, le texte peut être changé avec des crochets `[]` avec la locale à l'intérieur (par exemple `siteTitle[locale]`).

### Ajouter la liste des messages dans le flux RSS

Ensuite, nous ajoutons les articles un par un dans le flux RSS en utilisant `.addItem()`.

Dans mon environnement, les conditions sont ;

- Chaque article est généré par `/pages/post/[slug].js` => l'URL est quelque chose comme `https://example.com/post/my-post/` (pour les locales non par défaut, `/ja/` serait inséré).
- Les métadonnées (`title`, `slug` ou `date`) de chaque article sont gérées par Frontmatter.

Ici, j'utilise `marked` comme convertisseur du Markdown `content`, mais c'est bien sûr à vous de voir ; vous pouvez utiliser une autre bibliothèque ou un autre module. Tout dépend de votre environnement de l'état.

<div class="filename">/lib/feed.js</div>

```js
import { Feed } from 'feed'
import { marked } from "marked"

export default function GeneratedRssFeed(locale, posts) {
  //...
  const feed = new Feed({
    //...
  })

  posts.forEach(post => {
    feed.addItem({
      title: post.frontmatter.title,
      id: locale === defaultLocale
        ? `${siteUrl}post/${post.frontmatter.slug}/`
        : `${siteUrl}${locale}/post/${post.frontmatter.slug}/`,
      link: locale === defaultLocale
        ? `${siteUrl}post/${post.frontmatter.slug}/`
        : `${siteUrl}${locale}/post/${post.frontmatter.slug}/`,
      description: marked(post.content).slice(0, 120),
      content: marked(post.content),
      author: [
        {
          name: author,
          email: email,
          link: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`
        }
      ],
      date: new Date(post.frontmatter.date),
    })
  })
}
```

Les URLs pour `link` et `id` sont séparées selon la langue.

De plus, dans cet exemple, je génère une `description` de 120 caractères et un `content` pour le texte intégral. Changez-les si vous en avez besoin.

### Enregistrer les flux RSS pour chaque langue

Enfin, sauvegardez les flux RSS dans le répertoire `/public/rss/` avec le module fs.

Comme les flux RSS doivent être générés et sauvegardés pour chaque langue, j'ai ajouté les locales juste avant les extensions (par exemple `feed.en.xml`).

<div class="filename">/lib/feed.js</div>

```js
import fs from 'fs'
//...

export default function GeneratedRssFeed(locale, posts) {
  //...
  posts.forEach(post => {
    //...
  })

  fs.mkdirSync('./public/rss', { recursive: true })
  fs.writeFileSync(`./public/rss/feed.${locale}.json`, feed.json1())
  fs.writeFileSync(`./public/rss/feed.${locale}.xml`, feed.rss2())
  fs.writeFileSync(`./public/rss/atom.${locale}.xml`, feed.atom1())
}
```

## Générer des flux RSS avec getStaticProps de la page d'accueil du blog

Lorsque vous générez la page d'accueil du blog (= page de liste des messages récents) avec `getStaticProps`, générez les flux RSS ensemble.

Dans ce blog (route360.dev), la page d'accueil du blog est affichée depuis `/pages/index.js`. Il suffit d'insérer la fonction feed à l'intérieur de `getStaticProps`.

Parce que nous faisons un site web par i18n de Next.js, `getStaticProps` reçoit `{ locale }` comme contexte. Cette `locale` peut être envoyée comme premier argument de `GeneratedRssFeed()`.

- 1er argument: `locale`
- 2ème argument: list of the `posts`

Dans cet exemple, la liste des messages comprend les cinq derniers messages en utilisant `slice()`.

<div class="filename">/pages/index.js</div>

```js
import GeneratedRssFeed from 'lib/feed'

//...

export async function getStaticProps({ locale }) {
  //...
  GeneratedRssFeed(locale, posts.sort(sortByDate).slice(0, 5))
  //...
}
```

`sortByDate` est une fonction personnalisée qui a été utilisée dans "[Comment j'ai construit mon site web avec Next.js + Markdown + i18n](/fr/post/points-for-internationalization/#créer-un-contenu-pour-la-page-de-la-liste---getstaticprops)" ; cette fonction trie le message par date.

Vous y êtes presque. Lorsque `index.js` est accessible depuis un navigateur, les flux RSS pour la langue affichée doivent être générés dans le répertoire `/public/rss`.

## Ajouter du répertoire rss au fichier .gitignore

Pour éviter les conflits en production, ajoutez le répertoire `/public/rss` dans `.gitignore`.

<div class="filename">/.gitignore</div>

```text
/public/rss
```

## Enregistrez les flux sur Google Search Console et Bing Webmaster Tools

Enregistrez les flux RSS auprès des moteurs de recherche comme vous le souhaitez.

## Le code (conclusion)

Les composants finaux de la fonction de flux RSS sont les suivants ;

<div class="filename">/lib/feed.js</div>

```js
import fs from 'fs'
import { Feed } from 'feed'
import { marked } from "marked"

export default function GeneratedRssFeed(locale, posts) {
  const siteTitle = {
    en: "My Great Website!",
    fr: "Mon site web superbe !",
    ja: "私のサイトは素晴らしい！",
  }
  const siteDesc = {
    en: "This is my finest website ever.",
    fr: "C'est mon site web le plus cool !",
    ja: "これ以上ない素晴らしすぎるサイトです。",
  }
  const siteUrl = "https://example.com/"
  const defaultLocale = "en" // default locale
  const author = "Tokugawa Ieyasu"
  const email = "ieyasu@example.com"

  const feed = new Feed({
    title: `${siteTitle[locale]}`,
    description: siteDesc[locale],
    id: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`,
    link: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`,
    language: locale,
    image: `${siteUrl}image.png`,
    favicon: `${siteUrl}favicon.png`,
    copyright: `Copyright ${siteTitle} All rights reserved`,
    generator: "Feed for Node.js", // option (default: https://github.com/jpmonette/feed)
    updated: new Date(), // option (default: today)
    feedLinks: {
      json: `${siteUrl}rss/feed.${locale}.json`,
      rss2: `${siteUrl}rss/feed.${locale}.xml`,
      atom: `${siteUrl}rss/feed.${locale}.xml`,
    },
    author: {
      name: author,
      email: email,
      link: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`
    }
  })

  posts.forEach(post => {
    feed.addItem({
      title: post.frontmatter.title,
      id: locale === defaultLocale
        ? `${siteUrl}post/${post.frontmatter.slug}/`
        : `${siteUrl}${locale}/post/${post.frontmatter.slug}/`,
      link: locale === defaultLocale
        ? `${siteUrl}post/${post.frontmatter.slug}/`
        : `${siteUrl}${locale}/post/${post.frontmatter.slug}/`,
      description: marked(post.content).slice(0, 120),
      content: marked(post.content),
      author: [
        {
          name: author,
          email: email,
          link: locale === defaultLocale ? siteUrl : `${siteUrl}${locale}/`
        }
      ],
      date: new Date(post.frontmatter.date),
    })
  })

  fs.mkdirSync('./public/rss', { recursive: true })
  fs.writeFileSync(`./public/rss/feed.${locale}.json`, feed.json1())
  fs.writeFileSync(`./public/rss/feed.${locale}.xml`, feed.rss2())
  fs.writeFileSync(`./public/rss/atom.${locale}.xml`, feed.atom1())
}
```

C'est fait ! C'était un peu fatiguant, cependant.😕

Les flux RSS n'ont pas d'effet direct sur le référencement, mais ils augmentent le nombre de robots d'exploration et le taux de visiteurs réguliers.