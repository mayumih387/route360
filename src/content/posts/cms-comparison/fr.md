---
title: Comparaison CMS sans tête pour un site international
tags:
  - cms
  - jamstack
  - internationalization
date: 2022-10-10T04:38:17.017Z
lastmod: 2022-10-27T06:56:17.698Z
draft: false
---

J'ai construit ce site web (route360.dev) avec Next.js et Markdown en 3 langues (français, anglais et japonais).

Comme j'avais exprimé à "[À propos de l'architecture de ce site web](/fr/post/architecture/)", j'ai fait ce site avec DatoCMS au début.

Si vous allez construire un site web monolingue, il n'a pas de besoin de penser à Headless CMS - Système de Gestion de Contenu (SGC) sans tête profondément. Mais sinon, ça doit être dur à faire le bon choix, spécialement en 3 langues ou plus.

Ici je voudrais partager mes revues pour quelques CMS majeurs de point de vue d'internationalisation.

<span class="label success">note</span> Les captures d'écran ont été faites en septembre/octobre 2022. Les tarifs et les numéros peuvent changer en future. SVP référez la dernière version en chaque service.

L'ordre est par le classement des scores de [G2.com](https://www.g2.com/categories/headless-cms) en octobre 2022.

## SanityCMS

https://www.sanity.io/

- Local + Cloud
- Records sur le forfait gratuit: 10 000
- Locales sur le forfait gratuit: illimité
- Utilisateurs sur le forfait gratuit: illimité

<!-- out of toc -->
### J'aime:

- Reflet de la vue en temps réel entre le local et le cloud
- Pas de limite pour les locales

<!-- out of toc -->
### Je n'aime pas trop:

- Des champs pour toutes les langues dans une seule vue de l'éditeur
- Pas très claire où les données sont conservées
- Encombrant pour les réglages

Selon [G2.com](https://www.g2.com/categories/headless-cms), SanityCMS est le CMS le plus populaire dans le monde. Mais, je ne suis pas très satisfaite avec leur UI/UX concernant l'internationalisation.

Dans l'éditeur, les champs pour traduction apparaissent dans la même vue.

![SanityCMS Editor vue](../../../images/sanity01.png "Les champs pour traduction &copy;SanityCMS")

Vous pouvez poster un article traduit comme un autre post. Mais dans ce cas-là, les articles ne peuvent pas partager le même slug, ce qui rend difficile le changement de langue de l'article dans le frontend.

![SanityCMS la vue de l'éditeur](../../../images/sanity02.png "La traduction comme un autre article &copy;SanityCMS")

À quelques CMS que je reverrai plus tard, l'éditeur pour traduction est fourni dans différentes vues avec les tabs ou le menu déroulant pour changer de langue. C'est dommage que Sanity ne soit pas comme ci.

De plus, il est fastidieux de développer les paramètres localement, alors que les données sont stockées dans le cloud. On a besoin de prendre le temps et apprendre leur système unique. Je trouve que ce n'est pas pour les débutants.

## StoryBlok

https://www.storyblok.com/

- Cloud
- Records sur le forfait gratuit: 10 000
- Locales sur le forfait gratuit: illimité
- Utilisateurs sur le forfait gratuit: 1
- Éditeur Visuel

<!-- out of toc -->
### J'aime:

- Une seule langue dans une seule vue de l'éditeur
- Nombre illimité de locales

<!-- out of toc -->
### Je n'aime pas trop:

- Leur Éditeur Visuel est trop riche pour ce type de site web

Un CMS sans tête qui a pris de l'ampleur récemment. Leur Éditeur Visuel rappelle l'éditeur Gutenberg de WordPress (il n'est pas si super flexible comme Gutenberg quand même).

Il y a un menu déroulant sur la barre supérieure qui permet de changer de langue.

Par example, une fois que vous avez posté dans la locale par défaut,

![StoryBlok la vue de l'éditeur](../../../images/storyblok01.png "Poster dans la locale par défaut &copy;StoryBlok")

vous pouvez ajouter la traduction ()

you can make its translation (la capture d'écran ci-dessous est en français).

![StoryBlok la vue de l'éditeur](../../../images/storyblok02.png "Traduire-le en français &copy;StoryBlok")

La seule chose dommage est la liste des articles ne peut pas être filtrée en fonction de la locale, ce qui est possible avec DatoCMS ou Prismic.

Ce CMS doit être le bon choix quand des non-programmeurs seront considérés comme des éditeurs.

## Contentful

https://www.contentful.com/

- Cloud
- Records sur le forfait gratuit: 25 000
- Locales sur le forfait gratuit: 2
- Utilisateurs sur le forfait gratuit: 5

<!-- out of toc -->
### J'aime:

- Un des pionniers du Headless CMS, beaucoup de connaissances sur le web
- Assez de recodes - pas de souci pour un usage personnel avec le forfait gratuit

<!-- out of toc -->
### Je n'aime pas trop:

- Des champs pour toutes les langues dans une seule vue de l'éditeur
- Seulement 2 locales sur le forfait gratuit

Comme SanityCMS, Contentful affiche les champs pour toutes les langues dans la même vue de l'éditeur.

![Contentful la vue de l'éditeur](../../../images/contentful01.png "Les champs pour toutes les locales &copy;Contentful")

Par example, quand le "title" est un champ obligatoire, vous ne pouvez pas rester la traduction du title vide en version brouillon, parce que le champ est obligatoire pour toutes les locales. Vous devez saisir quelque chose même si vous voulez le faire plus tard.

Ce n'est pas util quand vous voulez traduire petit à petit, cependant, ça va aller si vous publier toujours toutes les traductions en même temps ou si le site web n'est pas édité si fréquemment.

## Strapi

https://strapi.io/

- Local or VPS installation
- Recodes sur le forfait gratuit: illimité
- Locales sur le forfait gratuit: illimité
- Utilisateurs sur le forfait gratuit: illimité

Plutôt que de dire "le forfait gratuit", il est complètement gratuit car Strapi est un CMS open source. Il faut l'exécuter par soi-même localement, ou sur certains VPS (serveur privé virtuel). Leur version Cloud est en cours de développement actuellement en octobre 2022.

<!-- out of toc -->
### J'aime:

- Nombre illimité de locales
- Interface utilisateur sophistiquée
- Une seule langue dans une seule vue de l'éditeur
- **Plugin officiel DeepL**

<!-- out of toc -->
### Je n'aime pas trop:

- Ce ne sera pas gratuit si l'on l'exécuter sur VPS (≥ 10 USD)

L'installation est nécessaire. Il est possible d’exécuter Strapi localement, et dans ce cas, il faut uploader les donnés de votre projet après "build".

Leur UI est remarquablement sophistiquée, et l'expérience de traduction est également excellente.

Une fois éditer en locale par défaut (l'anglais dans cet example),

![Strapi la vue de l'éditeur](../../../images/strapi01.png "Poster en locale par défaut &copy;Strapi")

ajouter la traduction en autre locale (français).

![Strapi la vue de l'éditeur](../../../images/strapi02.png "Traduction en français &copy;Strapi")

De plus, ils fournissent le plugin officiel DeepL qui permet de traduire facilement le contenu, avec un compte API gratuit DeepL. C'est énorme.

<span class="label warning">Référence</span> [DeepL | Strapi Market](https://market.strapi.io/plugins/strapi-plugin-deepl)

En parlant du coût, au cas où on aura besoin d'éditer les articles avec les autres, l'installation sur certains VPS sera nécessaire alors que l'installation locale est suffisante pour une personne.

*Parce que cela nécessite Node.js, fonctionne pas sur les serveurs d'hébergement mutualisé traditionnels comme vous le faisiez avec WordPress.

Car la mémoire minimale requise est de 2 Go de RAM (4 Go et plus recommandés), le plan de 10 USD de [DigitalOcean](https://www.digitalocean.com/) ou [AWS lightsail](https://aws.amazon.com/jp/lightsail/pricing/) doit être nécessaire. -> [Strapi Docs](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment.)

## Hygraph

https://hygraph.com/

- Cloud
- Records sur le forfait gratuit : 1 000
- Locales sur le forfait gratuit: 2
- Utilisateur sur le forfait gratuit: 3

<!-- out of toc -->
### j'aime:

- Modifier facilement le contenu en fonction de la langue
- Possibilité d'ajouter/supprimer des langues pour chaque article

<!-- out of toc -->
### je n'aime pas trop:

- Nombre réduit de records (1 000), mais suffisant pour une utilisation personnelle ou professionnelle.

C'est un CMS dont on peut sentir la forte philosophie, notamment dans l'UI de l'éditeur de contenu. Je l'adore.

Le nombre de locales est de 2 pour leur forfait gratuit comme [Contentful](#contentful), mais leur UI est très différente de celle de Contentful;

- Vous n'ajoutez la traduction que lorsque vous le souhaitez
- Vous pouvez masquer/afficher les éléments par locale

C'est donc beaucoup plus convivial.

Après l'édition en anglais,

![Hygraph Editor vue](../../../images/hygraph01.png "Éditer dans la langue par défaut (l'anglais dans ce cas) &copy;Hygraph")

Ensuite, tu peux ajouter du japonais si tu veux. Si vous ne voulez pas, vous pouvez juste le laisser.

![Hygraph Editor vue](../../../images/hygraph02.png "Modifier en japonais &copy;Hygraph")

Vous pouvez même décider dans quelle langue vous allez publier l'article.

![Hygraph bouton à publier](../../../images/hygraph03.png "Vous pouvez choisir les locales à publier &copy;Hygraph")

Si le site ne comporte que deux langues et environ 300 articles, vous pouvez le faire gratuitement.

En outre, leur plugins officiels DeepL est annoncé comme "coming soon" (à partir d'octobre 2022). Le détail n'est pas encore clair, mais il prendra un grand avantage sur les autres CMS.

## DatoCMS

https://www.datocms.com/

- Cloud
- Records sur le forfait gratuit: 300
- Locales sur le forfait gratuit: 10
- Utilisateurs sur le forfait gratuit: 1

<!-- out of toc -->
### J'aime:

- Assez de locales
- UI facile
- Filtrer la liste des articles par locales

<!-- out of toc -->
### Je n'aime pas trop:

- Seulement 300 records sur le forfait gratuit
- C'était difficile d'ajuster les espaces blancs lors de l'édition de Markdown

J'aime leur UI comme l'expérience de traduction.

Pour la locale japonais, la vue est pour le japonais.

![DatoCMS la vue de l'éditeur](../../../images/datocms01.png "Éditer en locale par défaut (en japonais dans cet example) &copy;DatoCMS")

Vous pouvez décider quels articles auront la traduction. Si vous voulez, vous l'ajoutez. Même si vous ne voulez pas, pas de problème.

![DatoCMS la vue de l'éditeur](../../../images/datocms02.png "Ajouter la traduction en anglais &copy;DatoCMS")

Le seul problème de DatoCMS est que seulement 300 records sont offerts sur leur forfait gratuit. C'est bien moins que les 25 000 de Contentful ou les 2 500 de StoryBlok. Si 3 locales sont définies, seulement 100 articles pourraient être créés littéralement. Comme une catégorie ou une image est également comptée comme un record, il pourrait même être moins que 100.

Je considère donc que le forfait gratuit de DatoCMS est un bon choix pour les petites entreprises dont le site web a un contenu limité.

Il est facile à commencer car le système est identique à celui de Contentful. Leurs vidéos tutorielles sur YouTube ou leurs projets de démarrage sur GitHub sont très utiles.

## Prismic

https://prismic.io/

- Local + Cloud
- Records sur le forfait gratuit: illimité
- Locales sur le forfait gratuit: illimité
- Utilisateurs sur le forfait gratuit: 1

<!-- out of toc -->
### J'aime:

- Nombre illimité de locales
- Changez facilement de locale par le menu déroulant, une seule locale dans la vue d'édition.
- Chaque traduction peut comporter différents blocs de champs (appelés Slices).
- Reflet de la vue en temps réel entre le local et le cloud
- Filtrer la liste des articles par locales

<!-- out of toc -->
### Je n'aime pas trop:

- Encombrant pour les réglages

Bien que je n'aie essayé Prismic que pendant quelques heures, j'ai vraiment aimé leur UI et le nombre illimité de records/locales. Vous pouvez même filtrer les articles par locales.

Après avoir édité un article en anglais,

![Un article en anglais avec Prismic](../../../images/prismic01.png "&copy;Prismic")

ajouter la traduction seulement quand vous voulez.

![Ajouter une traduction en français avec Prismic](../../../images/prismic02.png "&copy;Prismic")

Le "Slice", le bloc de champs dans Prismic, et les types de contenu peuvent être édités par Slice Machine qui est exécuté localement.

Le réglage sur le local lui-même est le même que celui de [SanityCMS](#sanitycms), mais la Slice Machine de Prismic offre une UI très agréable alors que vous ne modifiez que le code dans SanityCMS.

![Slice Machine de Prismic](../../../images/prismic03.png "Slice Machine marche en localhost:9999 &copy;Prismic")

Le Slice

Ce système d'édition Slice est un peu similaire à l'éditeur de blocs de WordPress. Je le trouve intéressant.

Comme leur concept est très unique, il y a des choses à apprendre. Cependant, J'aime beaucoup Prismic parce que son expérience de traduction est exactement ce que je voulais.

## Markdown

C'est complètement gratuit, aucune restriction puisque touts les contenus sont gérés dans votre projet. Dans ce blog, j'utilise uniquement le format Markdown local.

<!-- out of toc -->
### J'aime:

- Gratuit
- Tout est sous mon contrôle

<!-- out of toc -->
### Je n'aime pas trop

- Vous devez concevoir son architecture, et apprendre comment récupérer le contenu pour chaque langue.
- Pas de système d'association comme catégories et étiquettes *avec [Front Matter](https://frontmatter.codes/) certaines peuvent être résolues.

Il devient toujours beaucoup plus compliqué de construire un site web multilingue qu'un site monolingue, même avec un CMS Headless.

Ce site est construit avec Next.js, et c'est mon premier site Next.js. Il m'a fallu quelques jours pour apprendre et comprendre comment publier des fichiers Markdown locaux en plusieurs langues, bien que l'internationalisation soit plus facile que pour Gatsby.js.

Si vous devez éditer des articles Markdown avec d'autres personnes, la révision de GitHub serait utile je pense.

C'est peut-être hors sujet, mais [Front Matter](https://frontmatter.codes/) est un excellent plugin VS Code pour l'édition locale de fichiers Markdown. Il facilite grandement la gestion des métadonnées telles que le titre, le slug, les catégories ou la date.

## Conclusion

Chaque CMS sans tête a ses avantages et ses inconvénients, il n'est pas toujours facile de choisir celui qui vous convient. Essayez-les.

Je suis personnellement satisfaite du Markdown local pour l'instant, car je suis libre de tout ce qui est extérieur.

- Pour 3+ langues: 1er Prismic, 2ème Strapi
- Pour 2 langues: 1er Hygraph, 2ème Contentful

Ce serait bien si vous partagez votre CMS préféré dans les commentaires ! 😊

