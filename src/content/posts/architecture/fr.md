---
title: À propos de l'architecture de ce site web
tags:
  - nextjs
  - markdown
  - jamstack
date: 2022-10-04T06:09:49.614Z
lastmod: 2022-10-27T06:56:31.532Z
draft: false
---

Voici l'architecture de ce site web (route360.dev), si vous vous intéressez.

## Cadre React: Next.js

J'ai choisi [Next.js](https://nextjs.org/) parce que c'était plus facile de mettre une internationalisation en œuvre. En effet, c'est ma première fois que j'ai utilisé Next.js.

J'essayais de le faire avec Gatsby.js au début.

Gatsby.js est très util pour les sites web qui ne sont pas très "React apps", mais je ne le trouve pas trop capable pour les sites web multilingue. Les plug-ins pour internationalisation de Gatsby.js sont un peu vieux; les plug-ins officiels ou extensions tierce partie ne sont pas être actualisés depuis des années, même les pages officiels en GitHub sont Error 404 pas trouvés.

### internationalisation

Avec Next.js, l'internationalisation est super simple; vous ajoutez un i18n paramètre au `next.config.js`.

`next.config.js` de ce site est:

<div class="filename">/next.config.js</div>

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['en', 'fr', 'ja'],
    defaultLocale: 'en',
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

Bien sûre que vous devez ajouter autres données pour le SEO (l'optimisation pour les moteurs de recherche), mais tous les `LINK` sont automatiquement redirigés seulement avec ce paramètre. Je n'utilise aucun autre extension ou modules.

## UI Framework: aucun

Aucun cadre de l'interface utilisateur n'est utilisé, que de modules CSS.

## Système de gestion de contenu: aucun

J'avais presque fini ce site avec [DatoCMS](https://www.datocms.com/) d'abord, mais leur forfait gratuit ne contient que 300 disques. Alors j'ai refait ce site avec les contenus locals de markdown.

Si vous planifiez un site web avec moins de 2 langues, [Contentful](https://www.contentful.com/) offre une bonne i18n option avec leur forfait gratuit (25k disques inclus). Comme je voulais 3 langues, je ne l'ai pas pu choisir.

## Hébergement: Vercel

https://vercel.com/

Je préférais [Cloudflare Pages](https://pages.cloudflare.com/) comme l'hébergement, mais avec i18n Next.js ne supporte pas `next export` qui est requis pour déployer Next.js chez eux. Alors je n'avais pad d'autre choix sauf Vercel (il a aussi marché sur Netlify, quand même)

## Autres

* Système de commentaires - [giscus](https://giscus.app/)
* Webfont - [Fontawesome](https://fontawesome.com/)
* Surligneur de la syntaxe - [Prism.js](https://prismjs.com/)
* Traduction - moi😅 avec beaucoup d'aide par DeepL et mes dictionnaires.

## Conclusion

J'ai construit ce site web en apprenant Next.js au même temps. Bien que j'aie perturbée par la différence entre Next.js et Gatsby.js, j'espère que je suis arrivée.

Comme je sais maintenant comment faire un site multilingue, je voudrais re-faire mes WordPress WPML sites avec Next.js en future...