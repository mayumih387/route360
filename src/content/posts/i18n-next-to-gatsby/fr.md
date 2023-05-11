---
title: Migrer un blog i18n vers Gatsby.js - Raisons et aperçu de la conception
tags:
  - gatsbyjs
  - jamstack
  - internationalization
date: 2023-05-10T15:00:00.000Z
lastmod: 2023-05-10T15:00:00.000Z
draft: false
---

J'ai déplacé ce blog de dév (route360.dev) de Next.js à Gatsby.js. [J'ai mis le dépôt ici](https://github.com/mayumih387/route360).

La raison principale est que je suis beaucoup plus à l'aise avec Gatsby.js.

## Aperçu et problèmes d'un blog multilingue que j'ai créé avec Next.js

Lorsque j'ai commencé ce blog en octobre 2022, je l'ai organisé comme suit ;

- Next.js v12
- 3 langues (comme maintenant)
- Hébergé sur Vercel (maintenant sur Cloudflare Pages)

Next.js a été mis à jour à la version 13 en octobre 2022 avec d'énormes changements.　Il a commencé à supporter l'i18n avec App Router, mais cela m'a coûté trop de tâches.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Internationalization, too!<br><br>Even basic i18n support can be handled since the App Router&#39;s improved support for handling layouts means you can create static i18n routes that don&#39;t read the dynamic `Accept-Language` header.<a href="https://t.co/vc5zt9K9hk">https://t.co/vc5zt9K9hk</a></p>&mdash; Lee Robinson (@leeerob) <a href="https://twitter.com/leeerob/status/1640445087024029696?ref_src=twsrc%5Etfw">March 27, 2023</a></blockquote>

Il sera peut-être plus facile à mettre à jour si je gère ce blog en monolingue. Les sites multilingues demandent toujours trop de travail.

De plus, j'ai l'impression que Next.js est beaucoup plus adapté aux applications full-stack, car c'est comme une compatibilité ascendante pour React.js brut.

D'un autre côté, comme je suis maintenant très habituée à Gatsby v5, j'ai voulu essayer un site multilingue avec Gatsby.

## Avantages que je pourrais trouver à migrer vers Gatsby.js

Puisque je suis habituée à Gatsby.js, voici les avantages que je pourrais obtenir en changeant ;

- GraphQL permet de connecter n'importe quel type de données (aucune API n'est nécessaire)
- GraphQL facilite grandement le filtrage du contenu par langue
- Optimisation des images avec gatsby-plugin-image (que je préfère à next/image)

En particulier, GraphQL est un grand avantage de Gatsby.js.

Vous pouvez ajouter et lier n'importe quel type de schéma, filtrer et trier le contenu plus facilement qu'en utilisant l'API.

## Inconvénients et précautions à prendre pour migrer vers Gatsby.js

Il y a cependant quelques inconvénients à migrer un site multilingue vers Gatsby.js.

- Beaucoup de choses à apprendre (je ne le sens pas car je suis habituée...)
- Tout peut fonctionner avec des plugins, ce qui vous fait peur
- gatsby develop / gatsby build prend plus de temps
- On ne peut pas utiliser @vercel/og

Comme Next.js n'a pas d'écosystème de plugins comme Gatsby, je devais toujours reformater Markdown ou alimenter le contenu avec des paquets Node génériques. Cela demandait plus de travail, mais je me sentais à l'aise pour tout contrôler par moi-même.

Avec Gatsby.js, en revanche, tout peut être résolu par des plugins. De nombreux plugins acceptent des configurations, mais vous pouvez vous sentir mal à l'aise et "black boxed".

D'autres différences dans les paramètres spécifiques aux sites multilingues sont notamment les suivantes ;

|                                                     | Next.js                       | Gatsby.js              |
| --------------------------------------------------- | ----------------------------- | ---------------------- |
| domaine                                             | sous-chemin / autres domaines | sous-chemin uniquement |
| liens internes pour chaque locale dans les Markdown | auto                          | manuel                 |
| locale de la page actuelle                          | facile                        | manuel                 |

Le sous-chemin signifie que le routage est du type example.com/ja/ ou example.com/en/.

Je n'ai pas essayé de plugins ou de paquets pour i18n cette fois-ci. Il peut être plus facile de router les chemins i18n si je les utilise.

## Ce que j'ai fait pour créer un blog multilingue avec Gatsby.js

Comme je l'ai mentionné plus haut, je n'ai pas utilisé de plugins ou de packages React pour le site multilingue, mais seulement le routage de `gatsby-node.js`.

Par conséquent, le design du site était le suivant ;

1. Routage de sous-chemins tels que route360.dev/ja/, route360.dev/en/, et route360.dev/fr/
2. Une fois l'accès à la première page (route360.dev) obtenu, la redirection se fait vers la première page anglaise route360.dev/en/.
3. Le contenu de chaque langue est nommé ja.md/en.md/fr.md dans un fichier portant le nom de slug.
4. Pour créer chaque page de billet individuelle, j'appelle la requête séparément pour chaque langue et je crée des chemins dans `gatsby-node.js`, puis je passe la locale `pageContext` au modèle de page de billet individuelle pour la détermination de la langue.
5. Vérifier si l'article a des traductions avec la `requête` de allMarkdownRemark + le filtre slug dans le modèle (si c'est le cas, afficher le(s) lien(s) vers la (les) traduction(s)).
6. Pour créer des pages d'archives, j'appelle la requête séparément pour chaque langue et je crée des chemins dans `gatsby-node.js`, puis je passe la locale `pageContext` au modèle de page d'archive pour déterminer la langue.
7. Générer des RSS pour chaque langue
8. Générer le format de date pour chaque langue

Allez voir [le dépôt](https://github.com/mayumih387/route360) si cela vous intéresse, car je l'ouvre au public.

Je couvrirai les détails dans d'autres articles du blog.

## Conclusion

### Impressions sur la refonte d'un blog multilingue avec Gatsby.js

[Lorsque j'ai construit un site multilingue avec Astro](/ja/post/astro-i18n/), j'ai dû placer du contenu sous chaque fichier de langue pour suivre son système de routage. C'était bien que `gatsby-node.js` de Gatsby me permette de les placer où je voulais.

De plus, avec le blog précédent utilisant Next.js, je n'étais pas vraiment en mesure de vérifier si chaque article individuel avait une ou des traductions, et les liens et métadonnées vers les en-têtes étaient affichés même s'il n'y avait pas d'articles traduits. Mais maintenant, avec GraphQL, je peux facilement filtrer les articles par langue, ce qui me permet de cacher les liens et les métadonnées si l'article n'est pas traduit.

Cela me permet de ne publier que la version japonaise sans attendre la traduction.

### Aspects futurs

#### TypeScript peut-être ?

Je n'ai pas inclus TypeScript car je ne pense pas que ce soit nécessaire pour le moment. Si je suis motivée à l'avenir, je pourrais essayer de réécrire les fichiers.

#### Génération du plan du site

Pour l'instant, je tape toujours le plan du site à la main. [Gatsby.js fournit officiellement un plugin de sitemap](https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/), mais il semble qu'il faille le configurer pour un style multilingue.

#### Images OGP automatiques

J'espère pouvoir intégrer à l'avenir un générateur automatique d'images OGP comme celui de GitHub.
