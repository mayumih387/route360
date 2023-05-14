---
title: Comment j'ai construit mon site web avec Next.js + Markdown + i18n
tags:
  - nextjs
  - internationalization
  - markdown
date: 2022-10-15T07:47:08.532Z
lastmod: 2022-10-25T14:30:20.387Z
draft: false
---

Voici ce sont mes notes comment j'ai construit ce cite web multilingue depuis le début.

Ce qui était fur pour moi est que appeler les fichiers Markdown en local par chaque locale, parce que j'avais décidé de ne pas utiliser de CMS (SGC) sans tête.

Avec un CMS, la gestion de contenu et la pagination (je n’en exprimerai pas cette fois) seront beaucoup plus facile. Si je devais choisir un des plans gratuits, je préfère [Hygraph](https://hygraph.com/) pour 2 langues, ou [Prismic](https://prismic.io/) pour 3 ou plus langues.

<span class="label warning">Poste correspondant</span> [Comparaison CMS sans tête pour un site international](/fr/post/cms-internationalization/)

Environnement de travail :

- Node.js v16.18.0
- React v18.2.0
- Next.js v12.3.1
- prismjs v1.29.0

## Ajouter locales à next.config.js

Avant tout, il faut ajouter locales à next.config.js.

Comme ce blog est géré en 3 locales (français, anglais comme le défaut et japonais), le paramètre est le suivant;

<div class="filename">/next.config.js</div>

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en", "fr", "ja"],
    defaultLocale: "en",
  },
}

module.exports = nextConfig
```

Ce réglage est pour "Sub-path Routing"

- URL pour la locale par défaut: `example.com`
- autres: `example.com/fr` ou `example.com/ja`

Vous pouvez choisir "Domain Routing" aussi. Jetez un clin d'œil au guide officiel de Next.js.

<span class="label warning">Référence</span> [Internationalized Routing | Next.js](https://nextjs.org/docs/advanced-features/i18n-routing)

❗`next export` ne supporte pas ce réglage de i18n. Faites attention sur votre choix de l'hébergement parce que quelques uns comme Cloudflare Pages nécessitent le déploiement de `next export`.

### Récupérer les locales via useRouter()

Une fois le paramètre i18 ajouté au fichier `next.config.js`, toutes les informations sur les locales peuvent être récupérées via `useRouter()` de Next.js.

```js
import { useRouter } from "next/router"

export default function SomeComponent() {
  const { locale, defaultLocale, locales } = useRouter()
  return (
    <>
      <p>La locale actuelle est{locale}</p>
      <p>La locale par défaut est {defaultLocale}.</p>
      <p>
        Les locales dans le réglage sont {locales.map(locale => `${locale},`)}
        です
      </p>
    </>
  )
}
```

Un example de résultat:

```md
La locale actuelle est fr.
La locale par défaut est en.
Les locales dans le réglage sont en, fr, ja,.
```

Cela permet de séparer facilement les contenus par langue dans les composants ou les modèles.

## Déterminer où stocker les fichiers Markdown

Il y a plein d'options à stocker les fichiers de post. Voici comment je réalise la structure du dossier du répertoire;

```tree
ROOT
├─ pages/
│    └─ ...
├─ posts/
│    ├─ first-post/
│    │    ├─ en.md
│    │    ├─ fr.md
│    │    └─ ja.md
│    ├─ second-post/
│    │    ├─ en.md
│    │    ├─ fr.md
│    │    └─ ja.md
```

- Chemin d'accès du répertoire -> slug de l'article
- Nom de fichier -> locale

La façon est à vous de décider. Vous pouvez préférer nommer ces fichiers comme `slug.lang.md`.\*.

\*Example: `first-post.fr.md`

Les noms de répertoires ou de fichier

Ces noms de répertoire ou de fichier influent sur la manière dont vous récupérez les éléments pour créer le chemin (slug).

Dans cet article, j'utilise le nom du chemin d'accès au répertoire comme titre de l'article. Arrangez et adaptez les codes à votre propre situation.

## Page de poste (article)

Le premier point clé est la page du poste.

Vous savez probablement déjà comment créer des chemins, mais maintenant il faut pense à le cas où "L'article en français est prêt mais pas en anglais".

### Au cas où il n'y a pas de traduction d'un article

Dans ce site web (route360.dev), je crée d'abord tous les chemins d'accès aux articles pour toutes les langues.

- Montrer "Désolée, la traduction n'est pas encore disponible".
- Ajouter `noindex` à `<meta>` tag ([à discuter plus tard](#noindex-pour-les-articles-dont-la-traduction-nexiste-pas)

Les pas doit être;

1. Créer tous les chemins d'accès pour toutes les langues même s'il y a des article sans traduction
2. Séparer le contenu de chaque cas (si la traduction est disponible ou pas)

### Créer les chemins d'accès - getStaticPaths

Et maintenant, créer les chemins d'accès (qui composent l'URL) par `getStaticPaths`.

Dans mon cas, je crée un répertoire nommé `/post/` sous `/pages/`, puis mets `[slug].js`\* comme modèle de page d'article.

\*C'est le nom de la ficher pour le modèle (le template) qui utilise slug comme chemin. Le chemin d'accès doit être quelque chose comme `example.com/post/first-post/`.

```tree
ROOT
├─ pages/
│    └─ post/
│         └─ [slug].js <-- ceci
├─ posts/
│    ├─ first-post/
│    │    ├─ en.md
│    │    ├─ fr.md
│    │    └─ ja.md
│    ├─ second-post/
│    │    ├─ en.md
│    │    ├─ fr.md
│    │    └─ ja.md
```

Ensuite, importez les modules `fs` et `path` pour gérer les fichiers locaux. L'installation n'est pas nécessaire car ce sont des modules par défaut de Node.js.

<div class="filename">/pages/post/[slug].js</div>

```js
import fs from "fs"
import path from "path"
```

Et maintenant, on crée les chemin par `getStaticPaths`.

Afin de générer les chemins de chaque article pour toutes les locales, récupérez et `map()` tous les noms de répertoires sous `/pages/posts/`, puis faites un tableau de slug + locale.

<div class="filename">/pages/post/[slug].js</div>

```js
//...

export async function getStaticPaths({ locales }) {
  // Récupérer tous les noms de répertoires sous /posts/
  const dirnames = fs.readdirSync(path.join("posts"))
  // Preparer un tableau vide pour stocker les chemins avec la locale
  const pathsArray = []

  //Lister tous les nomes de répertoires pour toutes les locales
  dirnames.map(dirname => {
    locales.map(language => {
      pathsArray.push({ params: { slug: dirname }, locale: language })
    })
  })

  return {
    paths: pathsArray,
    fallback: false,
  }
}
```

Le `pathArray` généré contient ces paramètres comme nous pouvons les voir par `console.log()`.

```js
;[
  { params: { slug: "first-post" }, locale: "en" },
  { params: { slug: "first-post" }, locale: "fr" },
  { params: { slug: "first-post" }, locale: "ja" },
  { params: { slug: "second-post" }, locale: "en" },
  { params: { slug: "second-post" }, locale: "fr" },
  { params: { slug: "second-post" }, locale: "ja" },
]
```

Avec ce tableau, générer le contenu du billet en appelant des fichiers Markdown pour chaque slug de `params` et `locale`.

### Créer la donné de contenu - getStaticProps

Le code de base pour la création de contenu est comme suivant;

<div class="filename">/pages/post/[slug].js</div>

```js
//...

// Réception des paramètres et de la locale générés dans getStaticPaths
export async function getStaticProps({ locale, params: { slug } }) {
  // 1. Lire le fichier markdown, et obtenir le contenu à l'intérieur

  // 2. Retourner les données à utiliser dans le frontend
  return {
    props: {},
  }
}
```

Les métadonnées (telles que le title, la date, etc.) doivent être définies en tant que YAML Frontmatter au tout début de chaque fichier Markdown. Afin de récupérer les métadonnées, importez `matter` de [gray-matter](https://github.com/jonschlinkert/gray-matter). \*gray-matter doit être installé.

<div class="filename">/pages/post/[slug].js</div>

```js
import fs from "fs"
import path from "path"
import matter from "gray-matter" //<-- ceci
```

Ensuite, on va générer le contenu d'article avec les fichiers Markdown, mais une chose: Si certains traductions ne sont pas encore prêtes, le code renvoie une erreur.

Pour éviter l'erreur, utilisez `try...catch` de javascript.

<span class="label warning">Référence</span> [try...catch - JavaScript - MDN Web Docs](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/try...catch)

Dans les cas sûrs, le code contenu dans `try` s'exécute, et dans les cas d'erreur, le code contenu dans `catch` s'exécute.

Si un fichier Markdown traduit attendu n'existe pas et s'il passe en `catch`, je retourne un `title` vide ; ce qui pourrait être utilisé pour afficher un contenu différent selon l'existence du `title`.

<div class="filename">/pages/post/[slug].js</div>

```js
//...

// Réception des paramètres et génération de la locale dans getStaticPaths
export async function getStaticProps({ locale, params: { slug } }) {
  // 1. Lire le fichier Markdown, et obtenir le contenu à l'intérieur
  try {
    // 2-A. Renvoyer le contenu vers le front-end
    return {
      props: {},
    }
  } catch (e) {
    // 2-B. Si le fichier de traduction n'existe pas, il faut retourner un titre vide.
    return {
      props: {
        frontmatter: {
          title: "",
        },
        // content: 'No content!',
      },
    }
  }
}
```

A l'intérieur de `try`, j'ai ajouté le code comme ceci ;

<div class="filename">/pages/post/[slug].js</div>

```js
//...

export async function getStaticProps({ locale, params: { slug } }) {
  try {
    // 1-1. Lire le fichier Markdown, et obtenir le contenu à l'intérieur
    const markdownWithMeta = fs.readFileSync(
      path.join('posts/' + slug + `/${locale}.md`),
      'utf-8'
    )
    // 1-2. Obtenir des métadonnées par le biais du Frontmatter et du contenu
    const { data: frontmatter, content } = matter(markdownWithMeta)

    // 2-A. Renvoyer le contenu vers le front-end
    return
      {
        props: {
          frontmatter: JSON.parse(JSON.stringify(frontmatter)),
          content,
        },
      }
  } catch (e) {
    //...
  }
}
```

Note : Dans ce blog, je sépare à nouveau le contenu à l'intérieur de `try` dans le cas où le Frontmatter a `draft : true`.

### Sortie pour le frontend

Donc, il est maintenant prêt à afficher les métadonnées de `frontmatter` et `content` en frontend. Le code doit être comme le suivant ;

<div class="filename">/pages/post/[slug].js</div>

```js
//...

export default function Post({ frontmatter: { title, date }, content }) {
  return (
    <>
      <h1>{title}</h1>
      <article dangerouslySetInnerHTML={{ __html: marked(content) }} />
      {/* Convertir Markdown en HTML avec marked */}
    </>
  )
}
```

En plus, au cas où la traduction ne sort pas, je montre le truc "La traduction n'est pas disponible". Il est possible de détourner le contenu par la présence de `title`.

De plus, pour changer la phrase "La traduction n'est pas disponible" par les locales, utilisez `locale` qui est un paramètre de `useRouter()`.

<div class="filename">/pages/post/[slug].js</div>

```js
//...
import { useRouter } from 'next/router'

export default function Post({
  frontmatter: { title, date },
  content,
}) {
  const { locale } = useRouter() {/* Obtenez la locale actuelle ici */}
  return title !== '' ? (
    <>
      <h1>{title}</h1>
      <article dangerouslySetInnerHTML={{__html: marked(content)}} />
    </>
  ) : (
    <>{/* S'il n'y a pas la traduction */}
      <h1>Sorry!</h1>
      {locale === 'ja' && (
        <p>この記事はまだ日本語に訳せておりません。ごめんなさい。</p>
      )}
      {locale === 'fr' && (
        <p>Pardonnez-moi, cet article n&#39;est pas encore disponible en français.</p>
      )}
      {locale === 'en' && (
        <p>Sorry, this entry is not available yet in English.</p>
      )}
    </>
  )
}
```

Dans la plupart des cas, on utilise plutôt les Composants. Veuillez justifier le code ci-dessus pour votre situation.

### Format de la date par langue

Les formats de date varient selon la région ou la langue.

Dans ce blog, les dates sont affichées comme suivant;

- français: le 30 sept. 2022
- anglais: Sep 30, 2022
- japonais: 2022-9-27

Pour ce faire, j'ai créé un composant permettant de convertir le format de la date en fonction de la locale.

D'abord, importer un module [date-fns](https://github.com/date-fns/date-fns) à l'intérieur de la Composant (installation nécessaire)

<div class="filename">/components/convert-date.js</div>

```js
import { parseISO, format } from "date-fns"
import ja from "date-fns/locale/ja"
import en from "date-fns/locale/en-US"
import fr from "date-fns/locale/fr"
import { useRouter } from "next/router"

export default function ConvertDate({ dateISO }) {
  const { locale } = useRouter()
  return (
    <time dateTime={dateISO}>
      {locale === "fr" &&
        format(parseISO(dateISO), "d MMM yyyy", { locale: fr })}
      {locale === "en" &&
        format(parseISO(dateISO), "MMM d, yyyy", { locale: en })}
      {locale === "ja" && format(parseISO(dateISO), "yyyy-M-d", { locale: ja })}
    </time>
  )
}
```

Importez aussi chaque fichier de locale de `date-fns`, et divisez le résultat par locale.

Ensuite, appelez ce Composant à l'intérieur de `[slug].js`, et faire passer les données de la date par le Composant.

<div class="filename">/pages/post/[slug].js</div>

```js
//...
import ConvertDate from "components/convert-date"

export default function Post({ frontmatter: { title, date }, content }) {
  return title !== "" ? (
    <>
      <h1>{title}</h1>
      <ConvertDate dateISO={date} /> {/* <-- ceci */}
      <article dangerouslySetInnerHTML={{ __html: marked(content) }} />
    </>
  ) : (
    {
      /* Résultat dans le cas où aucune traduction n'est disponible */
    }
  )
}
```

### Système de commentaires

J'utilise [giscus](https://giscus.app/fr) pour commentaires.

Parce que giscus peut changer la langue, je change la langue par la locale actuelle.

<div class="filename">/components/comments.js</div>

```js
import Giscus from '@giscus/react'
import { useRouter } from 'next/router'

export default function Comments() {
  const { locale } = useRouter() {/* <-- locale actuelle */}
  return (
    <Giscus
      repo="[votre référentiel]"
      repoId="[ID du référentiel]"
      category="[catégorie]"
      categoryId="[ID de la catégorie]"
      mapping="title"
      reactionsEnabled="1"
      emitMetadata="1"
      theme="preferred_color_scheme"
      lang={locale} {/* <-- définir la locale ici */}
      crossOrigin="anonymous"
    />
  )
}
```

Vous pouvez vérifier d'autres propriétés sur [giscus officiel](https://giscus.app/)

Dans mon cas (ce blog), je n'ai pas ajouté la prop lazyload car il a provoqué une erreur DOM lorsque la langue est changée (Tâche n° 1 🙁)

## Page de la liste des articles

Pour la page de la liste des articles (`/pages/index.js` dans ce blog), vous devez considérer à nouveau le cas où il y a des articles non traduits.

Vous pouvez bien sûr utiliser un autre fichier pour les articles de la liste, `/pages/post/index.js` par exemple.

La page de liste ne nécessite pas les [Routes dynamiques](https://nextjs.org/docs/routing/dynamic-routes), vous n'avez pas besoin de `getStaticPaths` pour générer des chemins. Seul `getStaticProps` est nécessaire pour générer ce qui sera affiché en frontend.

### Créer un contenu pour la page de la liste - getStaticProps

Le point important est le même que celui de la page de l'article, en gros.

Parce qu'une erreur peut se produire en essayant d'utiliser des fichiers de traduction inexistants, utilisez à nouveau `try...catch` ici.

<div class="filename">/pages/index.js</div>

```js
export async function getStaticProps({ locale }) {
  const dirnames = fs.readdirSync(path.join('posts'))

  const data = dirnames
    .map((dirname) => {
      try {
        // Récupérer tous les fichiers locaux par nom de répertoire (qui consiste en slug pour chaque article)
        const markdownWithMeta = fs.readFileSync(
          path.join('posts/' + dirname + `/${locale}.md`),
          'utf-8'
        )
        const { data: frontmatter, content } = matter(markdownWithMeta)
        return (
          slug: dirname,
          frontmatter,
          content
        )
      } catch (e) {
        // console.log(e.message)
      }
    })
    // Éliminer le contenu `undefined` généré par `catch`.
    .filter((e) => e)

  const posts = JSON.parse(JSON.stringify(data))

  return {
    props: {
      posts: posts
    },
  }
}
```

Maintenant, vous devriez voir la liste des articles. Cependant, l'ordre n'est pas encore par date.

Pour réordonner les articles par date, préparez une fonction pour trier les éléments. J'ai placé cette fonction dans le répertoire utilitaire.

<div class="filename">/utils/index.js</div>

```js
export const sortByDate = (a, b) => {
  return new Date(b.frontmatter.date) - new Date(a.frontmatter.date)
}
```

Importez ensuite cette fonction dans `/pages/index.js`, et triez les `posts` retournés.

<div class="filename">/pages/index.js</div>

```js
//...
import { sortByDate } from 'utils'

export async function getStaticProps({ locale }) {
  //...

  return {
    props: {
      posts: posts.sort(sortByDate) {/* <-- ceci */}
    },
  }
}
```

<span class="label warning">Référence</span> [Static Blog With Next.js and Markdown - Traversy Media | YouTube](https://www.youtube.com/watch?v=MrjeefD8sac)

C'est tout pour la page de la liste des articles triés par date.

\*Je ne vais pas expliquer cette fois-ci comment paginer, j'imagine que ce serait possible si vous pouviez comprendre les codes ci-dessus que j'ai expliqués...

## Pages de routes imbriquées

Pour la traduction des pages sans [Route dynamique](https://nextjs.org/docs/routing/dynamic-routes), je divise le contenu en utilisant `{ locale }` qui peut être récupéré par `useRouter()`.

Par exemple, cela ressemble à ce qui suit sur la page ABOUT `/pages/about.js`.

<div class="filename">/pages/about.js</div>

```js
import { useRouter } from "next/router"

export default function About() {
  const { locale } = useRouter()
  return (
    <article>
      {locale === "en" && (
        <p>Hi! I&#39;m Mayumi (she/her). Thanks for visiting my website.</p>
      )}
      {locale === "fr" && (
        <p>Coucou ! Je suis Mayumi (elle). Merci pour visiter mon site web.</p>
      )}
      {locale === "ja" && (
        <p>こんにちは、Mayumiです。サイトをご覧下さりありがとうございます。</p>
      )}
    </article>
  )
}
```

C'est vous qui décidez, l'importation de contenus à partir d'autres fichiers locaux est également possible.

## Sélecteur de langue

Pour le Language Switcher, j'ai fait un Composant pour lui. \*Aucun style n'est appliqué dans le code suivant.

<div class="filename">/components/language-switcher.js</div>

```js
import Link from "next/link"
import { useRouter } from "next/router"

export default function LanguageSwitcher() {
  const { locales, asPath } = useRouter()
  return (
    <ul>
      {locales.map(lang => (
        <li key={lang}>
          <Link href={asPath} locale={lang} hrefLang={lang} rel="alternate">
            <a>{lang.toUpperCase()}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

1. Récupérez toutes les locales avec `const { locales } = useRouter()` définies dans next.config.js, et listez-les toutes avec `map()`.
2. Pour le href du lien, ajoutez le chemin vers d'autres langues avec `const { asPath } = useRouter()`.

Par exemple, si la page actuelle est `/about/`, le commutateur affiche `/fr/about/` pour le français, ou `/ja/about/` pour le japonais.

## Métadonnées pour chaque locale

Les métadonnées pour SEO est une chose qui m'a fatiguée le plus.

Je ne montrerai pas les codes exacts, mais je vous montre ceux que j'ai faits pour ce blog.

### Résultat prévu des métadonnées

```html
<!-- Résultat -->
<title>[Title localisé]</title>
<link rel="canonical" href="[URL localisé]" />
<meta name="description" content="[Description localisée]" />
<meta property="og:title" content="[Title localisé]" />
<meta property="og:description" content="[Description localisée]" />
<meta property="og:url" content="[URL localisé]" />
<meta property="og:site_name" content="[Title de site localisé]" />
<meta property="og:locale" content="[Locale actuelle]" />
```

### Métadonnées selon les directives de Google concernant l'internationalisation

```html
<!-- Résultat -->
<link
  rel="alternate"
  hreflang="en"
  href="[Traduction en anglais de la page actuelle]"
/>
<link
  rel="alternate"
  hreflang="fr"
  href="[Traduction en français de la page actuelle]"
/>
<link
  rel="alternate"
  hreflang="ja"
  href="[Traduction en japonais de la page actuelle]"
/>
<link
  rel="alternate"
  hreflang="x-default"
  href="[Locale par défaut de la page actuelle]"
/>
```

<span class="label warning">Référence</span> [Versions localisées de vos pages | Google Search Central](https://developers.google.com/search/docs/specialty/international/localized-versions)

### Schéma pour chaque locale

Je génère le schéma, pour les résultats enrichis de Google, à l'intérieur de chaque modèle (template, comme `/pages/post/[slug].js`) et le faire passer par Meta Composant.

```html
<!-- Résultat -->
<script type="application/ld+json">
  [Schéma localisé]
</script>
```

### noindex pour les articles dont la traduction n'existe pas

Pour le cas où la traduction d'un article n'existe pas, il faut veiller à ce que les pages d'affichage sans contenu ne soient pas enregistrées auprès des moteurs de recherche.

```html
<!-- Résultat -->
<meta name="robots" content="noindex,nofollow" />
```

Dans la section [Sortie pour le frontend](#sortie-pour-le-frontend) de cet article, je divise le frontend par la présence de la traduction. Seulement quand les pages de billet sans traduction sont affichées, passez la propriété `noIndex` au Meta Composant.

<div class="filename">/pages/post/[slug].js</div>

```js
//...
import Meta from "/components/meta"

export default function Post({ frontmatter: { title, date }, content }) {
  return title !== "" ? (
    <>
      <Meta /> {/* Méta normal */}
      <h1>{title}</h1>
      <article dangerouslySetInnerHTML={{ __html: marked(content) }} />
    </>
  ) : (
    <>
      {/* Lorsqu'aucune traduction n'est disponible */}
      <Meta noIndex /> {/* passer la prop noIndex au Meta Composant */}
      <h1>Sorry!</h1>
      {locale === "fr" && (
        <p>
          Pardonnez-moi, cet article n&#39;est pas encore disponible en
          français.
        </p>
      )}
      {locale === "ja" && (
        <p>この記事はまだ日本語に訳せておりません。ごめんなさい。</p>
      )}
      {locale === "en" && <p>Sorry, this entry is not available yet in English.</p>}
    </>
  )
}
```

Le Méta composant est quelque chose comme ça;

<div class="filename">/components/meta.js</div>

```js
//...
export default function Meta({ noIndex = false }) {
  //...
  return (
    //...
    {noIndex && <meta name="robots" content="noindex,nofollow" />}
    //...
  )
}
```

Au cas où aucune traduction n'est disponible, je ne devrais probablement pas afficher [Métadonnées selon les directives de Google concernant l'internationalisation](#métadonnées-selon-les-directives-de-google-concernant-linternationalisation), mais je n'arrive pas encore à diviser les données (Tâche n°2 🙁).

## Sitemap (plan de site) XML

Bien qu'il y a des module de sitemap par tierces parties, ils ne sont pas optimisés pour les pages internationaux (selon mes recherches).

Par conséquent, je fais du hard-coding sitemap.xml à chaque fois qu'un nouveau billet est ajouté😱. Je devrais l'automatiser avec Python ou autre (je ne suis pas capable de faire un module par moi-même...).

<span class="label warning">Référence</span> [Versions localisées de vos pages | Google Search Central](https://developers.google.com/search/docs/specialty/international/localized-versions)

L'article ci-dessus de Google traite de l'internationalisation. Vous pouvez voir que c'est beaucoup plus compliqué que les sites web dans une seule langue.

Il serait préférable d'optimiser comme Google le mentionne, car faire un site multilingue est déjà un gros travail.

## Flux RSS

Chaque locale a chaque flux.

- feed.fr.xml
- feed.en.xml
- feed.ja.xml

Pour générer des flux, [feed](https://github.com/jpmonette/feed), un package Node. js est installé.

## Autres

### Chargement de Prism.js

Pour le chargement de Prism.js comme un surligneur syntaxique, je fais comme suit;

<div class="filename">/pages/post/[slug].js</div>

```js
const { locale, asPath } = useRouter()

useEffect(() => {
  Prism.highlightAll()
}, [locale, asPath])
```

De nombreux blogs techniques que j'ai consultés n'ont pas ajouté les deuxièmes dépendances (`[events]` ici), mais ça ne marche pas pour moi lorsque la langue est changée. C'est pour ça que j'ajoute les dépendances afin que Prism.js puisse être rendu à chaque transition de page.

\*Avec `events` qui peut être récupéré à partir de `const { events } = useRouter()`, cela ne fonctionne pas bien.

## Réflexions après la réalisation du site international (conclusion)

Honnêtement, c'était beaucoup plus dur de préparer un site web multilingue que j'avais imaginé. Bien que la traduction-même est dur déjà, il y a plein de chose en plus.

Parce que je génère tous les chemins même pour les articles non traduits cette fois-ci, il vaut mieux de publier après que toutes les traductions sont prêtes. Ce méthode est juste temporaire pour "les articles non traduits".

Comme j'ai ajouté beaucoup d’éléments dans ce blog actuel, ces codes sont un peu plus compliqués. J'espère rendre le dépôt ouvert une fois que la version sera stable dans le futur.
