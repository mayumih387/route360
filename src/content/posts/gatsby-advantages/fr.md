---
title: Les avantages de Gatsby - Pourquoi j'aime encore Gatsby bien plus que d'autres frameworks
tags:
  - gatsbyjs
  - nextjs
  - react
date: 2023-08-16
lastmod: 2023-08-22
draft: false
---

J'ai utilisé plusieurs frameworks frontend pendant des années, mais je suis revenu et me suis finalement installée sur Gatsby. Malheureusement, la popularité de Gatsby a diminué. Cependant, il est dommage de ne jamais l'essayer à cause de sa réputation.

Gatsby a de grands avantages que les autres frameworks n'ont pas. Je pense que Gatsby mérite d'être utilisé dans de nombreux projets !

Ainsi, en tant que grand utilisateur de Gatsby, j'aimerais expliquer les avantages (et quelques inconvénients) de Gatsby dans cet article.

Les frameworks que j'ai essayés sont les suivants. La plupart d'entre eux sont utilisés pour la construction de sites web.

- Gatsby
- Next.js (je ne comprends pas encore App Router...)
- Astro
- 11ty (juste essayé le tutoriel de base)
- Svelte/SvelteKit (juste essayé le tutoriel de base)

## Les avantages de Gatsby

### Vous pouvez unifier n'importe quelle donnée/API dans une interface GraphQL

La fonctionnalité la plus puissante de Gatsby, à mon avis, est **la fonctionnalité d'unification des données**. N'importe quelle donnée à n'importe quel endroit peut être unifiée dans n'importe quel(s) schéma(s) d'un GraphQL.

<blockquote class="twitter-tweet" data-theme="dark"><p lang="fr" dir="ltr">I&#39;m so impressed by Qwik, Remix, Next, etc, and would love to use them. But no one has solved the data layer as well as <a href="https://twitter.com/GatsbyJS?ref_src=twsrc%5Etfw">@GatsbyJS</a>. There&#39;s not even any competition. To be able to glue together APIs and make sense of them altogether is incredibly powerful.</p>&mdash; David Paulsson (@davidpaulsson) <a href="https://twitter.com/davidpaulsson/status/1653797711810797569?ref_src=twsrc%5Etfw">May 3, 2023</a></blockquote>

Par exemple, vous pourriez gérer les données d'un site web de la manière suivante :

- Contenu sur certains CMS
- Commentaires sur Firebase
- Pages vues sur Google Analytics

Avec le REST traditionnel, nous devons nous connecter à chaque API et récupérer tout d'abord, puis filtrer par slug ou par certaines conditions pour obtenir le résultat souhaité.

D'un autre côté, Gatsby nous permet d'intégrer toutes les données gérées à différents endroits dans un seul GraphQL, en se connectant à chaque API dans `gatsby-node.js`. Parce qu'il est beaucoup plus facile de filtrer et de trier les données avec GraphQL, vous pouvez obtenir "Les 10 titres et commentaires des articles les plus consultés" pour un instant.

L'article ci-dessous explique très bien la différence entre REST et GraphQL.

Lien - [GraphQL vs REST : Tout ce que vous devez savoir | kinsta.com](https://kinsta.com/fr/blog/graphql-vs-rest/)

![GraphQL de Gatsby](../../../images/gatsby-graphql01.png "Exemple : Créer un schéma pageViews et y coller des données Markdown.")

Les données que nous pouvons intégrer ne se limitent pas aux API. Les fichiers tels que xlsx, yaml ou json peuvent être collés ensemble s'ils ont des valeurs communes comme les slugs.

Donc **cette fonctionnalité d'intégration de données est la seule et unique fonctionnalité puissante que Gatsby possède**. Aucun autre framework ne la possède.

### GraphQL lui-même est également utile

GraphQL lui-même est utile pour le traitement des données par rapport à REST.

REST ne disposant pas de fonctions de tri et de filtrage, nous devons généralement créer ces fonctions nous-mêmes. GraphQL le fait.

Filtrer par draft/published et tags, ou trier par date ACS/DESC est un jeu d'enfant. Comme nous pouvons localiser rapidement les données que nous voulons, nous pouvons accélérer notre travail.

### Basé sur React

Gatsby est un framework basé sur React, nous pouvons donc profiter de son riche écosystème. Il en va de même pour Next.js, puisque Next.js est également basé sur React.

Ces jours-ci, de nouveaux frameworks comme Solid.js ou Svelte, qui couvrent les lacunes de React, deviennent plus populaires que React. Mais leur écosystème n'est pas encore très étendu.

React, en revanche, dispose toujours d'une grande communauté de développeurs. Des plugins populaires comme FontAwesome ou Swiper aux petits services de développeurs individuels qui publient leurs bibliothèques React officiellement. Si vous souhaitez ajouter une fonctionnalité de l'extérieur, vous ne serez jamais perdu.

Il ne faut pas non plus oublier que React a été développé par Meta, la société de Facebook. De même, Next.js (par Vercel), le framework le plus populaire, est basé sur React. La colonne vertébrale est si solide que nous n'avons pas à craindre que React perde sa réputation si rapidement.

### Plugin d'image puissant

Gatsby dispose de [gatsby-plugin-image](https://www.gatsbyjs.com/plugins/gatsby-plugin-image/), un excellent plugin pour l'optimisation des images.

Je l'ai intégré avec [gatsby-remark-images](https://www.gatsbyjs.com/plugins/gatsby-remark-images/) dans ce blog. Seulement avec eux, la sortie de l'image est déjà optimisée avec le blur et l'ensemble d'images (srcset).

Next.js dispose également de [next/image](https://nextjs.org/docs/pages/api-reference/components/image), mais il ne fonctionne qu'en tant que composant et ne convertit pas les images contenues dans le contenu de l'API. Lorsque vous voulez convertir des images, vous devez préparer le code vous-mêmes pour obtenir le contenu complet de l'article puis convertir les images.

## Ce qui me déçoit dans Gatsby...

### Moins énergique après son rachat par Netlify ?

En février 2023, Netlify a racheté Gatsby. Après cela, de nombreux ingénieurs ont été licenciés de Netlify. [Lennart](https://twitter.com/lekoarts_de) est l'un d'entre eux, bien qu'il ait aidé de nombreux développeurs (dont moi) dans les discussions officielles de Gatsby sur GitHub.

De plus, Gatsby n'a pas publié de nouvelle version depuis 2 mois, la dernière v5.11.0 datant du 15 juin 2023. Je me demande s'il n'y a pas encore une certaine confusion depuis l'acquisition...

### Le développement commence lentement

Comparé à Next.js, Astro et Svelte (SvelteKit), la construction de `gatsby develop` est beaucoup plus lente. Plus il y a de pages, plus la construction sera lente si le PC a peu de RAM.

Quant à `gatsby build`, je ne pense pas qu'il soit plus lent que les autres frameworks car cela dépend du nombre d'images que vous voulez générer. Pour votre information, le temps de construction de ce blog sur Cloudflare Pages est inférieur à 3 minutes.

### Coût de l'apprentissage

Après avoir suivi [un cours de 50 heures sur React sur Udemy](https://www.udemy.com/course/react-the-complete-guide-incl-redux/), j'ai compris que Next.js est conçu pour couvrir les inconvénients de React, comme les problèmes de SEO ou de routage. Il me semble qu'il est encore proche de React.

En comparaison, Gatsby est un peu loin et très caractéristique. J'ai dit "Vous pouvez unifier n'importe quelle donnée/API dans une interface GraphQL" au début de cet article, mais vous devez encore apprendre les fonctions originales de Gatsby.

L'utilisation de GraphQL en tant qu'API vous laisse peut-être perplexe. Cependant, GraphQL pour le frontend consiste simplement à récupérer des données comme REST. Je ne pense pas que ce soit si difficile.

Une fois ces points résolus, il ne reste plus qu'à utiliser React. Si vous êtes familier avec React, tout devrait bien se passer.

## Conclusion

Comme Next.js devient de plus en plus compliqué, je vous suggère d'utiliser Gatsby si vous aimez React.

Bien que je sois une utilisatrice assidue de Gatsby, je ne suis pas encore à l'aise avec la dernière fonctionnalité slice ou le routage basé sur les fichiers. Mais Gatsby est toujours attrayant et m'a fait revenir après avoir expérimenté Next.js et Astro.

Des sites web multilingues ? Oui, c'est possible, tout comme ce blog !