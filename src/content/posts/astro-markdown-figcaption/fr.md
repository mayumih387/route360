---
title: Ajouter <figcaption> aux images en Markdown [Astro 3.0]
tags:
  - astro
date: 2023-09-04
lastmod: 2023-09-04
---

Astro a lancé une nouvelle version majeure 3 le 30 août, incluant une nouvelle optimisation des images.

Les images qui se trouvaient dans le répertoire public dans la v2 devraient être déplacées dans le répertoire src/assets dans la v3, ce qui permettrait d'optimiser automatiquement toutes les images référencées dans les fichiers Markdown.

(Je ne sais pas si je devrais dire "optimisé" pour ce niveau de conversion...)

C'est utile, mais le résultat n'est que des balises `<img>`, sans légende. Pour résoudre ce problème, j'ai créé une fonction de conversion.

En d'autres termes, il suffit d'utiliser [Cheerio](https://cheerio.js.org/) pour éditer la sortie HTML elle-même. Pour la légende, nous utilisons l'élément `title`.

Environnement:

- Astro v3.0.7
- Cheerio v1.0.0-rc.12

## Aperçu

1. Installer Cheerio dans le projet
2. Attribuer le code HTML original à Cheerio
3. Pour les balises `<img>`, ajoutez `<figure>` et `<figcaption>` si l'image a un attribut `title`.
4. Supprimer le `<p>` enveloppant le `<img>` (optionnel)

Les images contenues dans les fichiers Markdown doivent être encodées comme suit :

```md
![Je suis `alt`](assets/example.jpg "Je suis `title` comme caption")
```

## Installer Cheerio dans le projet

D'abord, installez Cheerio dans le projet.

```bash
# npm
npm install cheerio

# yarn
yarn add cheerio
```

## Le Code

### Fonction de conversion

Créez convertHtml.js dans le répertoire des composants (ou d'autres, c'est à vous).

<div class="filename">src/components/convertHtml.js</div>

```js
import * as cheerio from "cheerio"

export default function convertHtml(html) {
  const $ = cheerio.load(html)
  $("img")
    .unwrap() // Supprimer les P tags
    .replaceWith((i, e) => {
      const { src, alt, title, width, height } = e.attribs
      // Si l'img a le title
      if (title)
        return `<figure>
          <img
            src=${src}
            alt=${alt}
            loading="lazy"
            title=${title}
            width=${width}
            height=${height}
            decoding="auto"
           />
          <figcaption>${title}</figcaption>
          </figure>`
      // si l'img n'a pas de title
      return `<img
          src=${src}
          alt=${alt}
          loading="lazy"
          width=${width}
          height=${height} 
          decoding="auto"
          />`
    })

  return $.html()
}
```

Bien que j'aie défini `auto` et `lazy` pour les attributs `decode` et `load`, c'est à vous de décider.

### Composant de layout pour les fichiers Markdown

Dans le composant layout, importez la fonction convert, puis réécrivez `<slot />` dans le code suivant.

<div class="filename">src/layouts/MarkdownLayout.astro</div>

```js
// before
<slot />

// after
---
import convertHtml from 'components/convertHtml'
const { compiledContent } = Astro.props
const htmlContent = compiledContent()
---
//...
<Fragment set:html={convertHtml(htmlContent)} />
```

C'est fait !
