---
title: Créer un i18n site web avec Astro
tags:
  - astro
  - internationalization
date: 2022-12-17T03:00:00.000Z
lastmod: 2023-02-24T04:20:39.015Z
draft: false
---

J'ai transformé un ancien site WordPress multilingue en site Astro.

Ici 👉[Visit Palestine](https://visit-palestine.net/en/)

*Les informations contenues dans ce site ne sont pas les plus récentes, elles sont donc données à titre indicatif.<br />
**Les publicités seront affichées. Veuillez ne pas ouvrir si vous ne souhaitez pas en voir.

Astro n'indique pas l'internationalisation du site dans sa documentation, mais ce n'est pas si difficile grâce à son système de routage ; les URL sont générées dès que vous placez des fichiers dans le dossier src. *Pourvu qu'il s'agisse d'un routage par sous-chemin avec des fichiers markdown.

Comme vous l'avez peut-être déjà remarqué, [Astro official docs]((https://docs.astro.build/en/getting-started/)) est bien internationalisé avec le routage par sous-chemin.

D'autre part, comme Astro n'est pas optimisé pour l'internationalisation comme Next.js, il y a du travail à faire.

Comme j'ai de l'expérience avec un site Next.js i18n (ce site, route360.dev), je compare Astro et Next.js sur certains points.

Environnement

- astro v.2.0.15

## Impression et réflexions sur le site i18n Astro

Bien qu'il s'agisse de mon premier site Astro, j'ai pu m'y mettre car j'ai déjà utilisé Next.js et Gatsby. L'intégration de React était si facile.

J'imagine que les concepteurs d'Astro font en sorte d'améliorer certains des systèmes inutiles/inconfortables de Next.js.

En même temps, l'optimisation des images d'Astro n'est pas aussi splendide que celle de next/image et de gatsby-plugin-image, et cela m'a demandé du travail (je ne peux pas encore dire que je puisse optimiser complètement les images).

### Bien que j'aie essayé le 11e, aussi...

J'ai essayé [11ty](https://www.11ty.dev/) pour le renouvellement de ce site web avant Astro.

C'est parce que 11ty était fortement recommandé pour les sites statiques à la Jamstack Conf 2022.

<iframe width="560" height="315" src="https://www.youtube.com/embed/AMCn7FwrUV0?start=1599" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

11ty supportera i18n avec son plugin officiel à partir de la version 2.0.0. Il permet de filtrer les langues, etc.

Cependant, je n'avais jamais utiliser Nunjucks avant, et cela m'a pris du temps à comprendre. Ensuite, j'ai essayé Astro et j'ai réussi à le comprendre facilement.

Une fois que vous êtes habitué à Nunjucks, 11ty + i18n doit être facile.

## What I did for an Astro i18n website

### Comment obtenir la locale actuelle

Dans le cas d'[Astro official documents](https://docs.astro.build/en/getting-started/), la locale actuelle est récupérée à partir de l'URL actuelle.

<span class="label warning">Référence</span> [util.ts | withastro/docs - GitHub](https://github.com/withastro/docs/blob/main/src/util.ts)

<div class="filename">/src/util.ts</div>

```ts
export function getLanguageFromURL(pathname: string) {
  const langCodeMatch = pathname.match(/\/([a-z]{2}-?[a-z]{0,2})\//);
  return langCodeMatch ? langCodeMatch[1] : 'en';
}
```

Sur [notre site web](https://visit-palestine.net/en/), j'ai fait presque la même chose en y faisant référence.

On peut envisager d'autres approches, comme l'ajout d'une clé et d'une valeur `lang` à YAML front-matter en Markdown ou l'obtention de la langue à partir d'API/Graph QL si vous utilisez un CMS.

### Sélecteur de langue

Je me demande toujours si j'ai besoin d'un sélecteur de langue, mais j'arrive à ajouter...

Dans la documentation d'Astro, la fonction de changement de langue (sélecteur) est réalisée avec javascript (typescript).

<span class="label warning">Référence</span> [LanguageSelect.tsx | withastro/docs  - GitHub](https://github.com/withastro/docs/blob/main/src/components/Header/LanguageSelect.tsx)

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

Sur [notre site web](https://visit-palestine.net/en/), j'ai fait un codage dur (je sais que je ne devrais pas, cependant) après avoir obtenu le slug actuel à partir du chemin actuel.

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

### Page 404 pour chaque langue

Nous pouvons réaliser la page 404 personnalisée dans Astro en plaçant `404.astro` ou `404.md` dans le répertoire `page`.

En regardant les [Astro Docs](https://docs.astro.build/en/getting-started/) sur GitHub, leur page 404 personnalisée par locale est générée selon les étapes suivantes ;

1. Créer `/page/404.astro`.
2. Créer `/page/[lang]/404.astro` puis lisez-le dans `/page/404.astro`.
3. Générer 404.html pour chaque locale au astro build
4. Afficher `/[lang]/404.html` au lieu de `/[lang]/*` lorsque le code d'état retourne 404 avec les redirections Netlify. Seulement quand l'URL est `/*`, il retourne la page 404 en anglais.

La 4ème étape m'ennuie parce que je voulais utiliser Cloudflare Pages ; Cloudflare Pages ne supporte pas encore les redirections 404 en date de décembre 2022.

<span class="label warning">Référence</span> [Redirects · Cloudflare Pages docs](https://developers.cloudflare.com/pages/platform/redirects/)

Parce que Netlify n'offert pas de serveur CDN gratuit au Japon (seulement pour le plan pro), je ne veux vraiment pas le choisir. Ou l'hébergement Firebase semble très encombrant avec leur CLI...

### XML Sitemap

Astro fournit [@astrojs/sitemap](https://docs.astro.build/fr/guides/integrations-guide/sitemap/), un plugin officiel de génération de sitemap.

Ce plugin s'adapte à l'i18n, mais je ne l'ai pas essayé.

Comme [notre site web](https://visit-palestine.net/en/) n'est pas un blog, et que je ne prévois pas d'ajouter de nouvelles pages, je génère un sitemap XML en utilisant un générateur de sitemap en ligne et des remplacements de texte.

## Les choses semblent difficiles avec le site web d'Astro i18n

D'autres choses demandent un peu de travail, bien que je ne les ai pas essayées avec [notre site web](https://visit-palestine.net/en/) cette fois-ci.

### Routage i18n du domaine

example: example.com + example.fr, ou en.example.com + fr.example.com

Nous pouvons choisir un routage par domaine en plus du routage par sous-chemin dans Next.js. Cependant, seul le sous-chemin dans Astro.

### RSS feed

Cela m'a demandé un peu de travail pour réaliser le flux RSS pour chaque langue dans Next.js.

<span class="label warning">Poste correspondant</span> [RSS feed pour un blog Markdown multilingue de Next.js](/fr/post/rss-feed-multilingual/)

Astro fournit également [@astrojs/rss](https://docs.astro.build/fr/guides/rss/#setting-up-astrojsrss), un plugin RSS officiel.

Comme nous pouvons personnaliser les textes ou les URL des flux, il est de toute façon possible de générer un flux RSS pour chaque langue.

### Contenu de la locale par défaut sous le répertoire racine (pas sous le répertoire de la langue)

Le routage d'Astro est identique à sa structure de répertoire sous `pages`.

Par conséquent, il serait compliqué de ne pas réaliser de sous-chemin pour la locale par défaut comme le site Next.js (comme ce site, [route360.dev](/)).

Le routage de 11ty est le même que celui d'Astro.

## Conclusion

Comme la documentation officielle d'Astro est multilingue et que son dépôt GitHub est public, je m'y suis référé plusieurs fois, heureusement.

L'ajout d'autres langues ne semble pas si difficile, sauf s'il ne s'agit pas d'une langue RTL...

Astro lui-même est convivial pour les développeurs si vous avez déjà expérimenté Next.js ou d'autres frameworks UI. Je l'aime bien !

### Références

- [astro Docs](https://docs.astro.build/fr/getting-started/)
- [withastro / Docs - GitHub](https://github.com/withastro/docs)
- [11ty](https://www.11ty.dev/)