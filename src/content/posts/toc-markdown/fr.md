---
title: Comment ajouter la table des matières à un blog Markdown
tags:
  - markdown
  - nextjs
  - gatsbyjs
date: 2022-11-10T01:00:00.208Z
lastmod: 2022-11-10T01:00:00.208Z
draft: false
---

Vous pouvez voir la table des matières de ce billet de blog ci-dessus. Ce billet porte sur la manière de procéder.

J'ai référencé ce blog ci-dessous, merci !

<span class="label warning">Référence</span> [Next.js + Markdown (marked) で作るブログサイト](https://chocolat5.com/tips/markdown-blog-nextjs/#%E7%9B%AE%E6%AC%A1%EF%BC%88table-of-contents%EF%BC%89)

Mes codes sont basés sur les siens et ont arrangé certains points.

Environnement de fonctionnement :

- Next.js v12.3.1
- marked 4.2.2

## Étapes à suivre

Tout d'abord, si [marked](https://github.com/markedjs/marked) n'est pas encore installé, installez-le.

```bash
## pour npm
npm install marked

## pour yarn
yarn add marked
```

<span class="label warning">Document officiel</span> [Marked Documentation](https://marked.js.org/)

Nous allons utiliser `lexer` - une des fonctions de marked. Elle retourne tous les éléments du contenu Markdown sous forme de jetons.

Lorsque le contenu Markdown est passé à `marked.lexer()`, le résultat sera un objet comme le suivant ;

```js
[
  {
    type: 'heading',
    raw: '## Headline Text',
    depth: 2,
    text: 'Headline Text',
    tokens: Array(1)
  },
  {
    type: 'paragraph',
    raw: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod te'
  },
  {
    type: 'heading',
    raw: '### Headline Text',
    depth: 3,
    text: 'Headline Text',
    tokens: Array(1)
  },
  {
    type: 'paragraph',
    raw: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod te'
  },
]
```

Comme vous pouvez maintenant l'imaginer, nous pouvons obtenir des rubriques avec `type : heading`. Par conséquent, les étapes seraient les suivantes ;

1. Prendre les rubriques et mettre-les dans un tableau.
2. Créer une liste de tableaux avec `map()` à partir de 1
3. Pendant 2, modifier les chaînes de texte des rubriques pour que les liens puissent fonctionner

Ensuite, la liste créée sera utilisée comme table des matières.

Pourquoi devons-nous modifier les chaînes de texte des rubriques à la 3ème étape ? C'est parce que les `id`s, générés et pointés vers chaque rubrique automatiquement, sont les chaînes déjà sorties sans espaces ni symboles (je vais en parler plus tard).

## Préparer un composant pour la table des matières

Passons maintenant au composant pour la Table des Matières (TDM).

Le Composant TDM aura une fonction pour faire une liste de rubriques à partir du contenu Markdown comme argument.

D'autre part, le `id` automatique de chaque rubrique, est régénéré à partir de la chaîne de rubriques ; les espaces deviennent un trait d'union (-), ou les symboles sont omis.

<div class="filename">Markdown</div>

```md
## Bonjour le monde !^.+*{}[]?
```

<div class="filename">HTML</div>

```html
<!-- Résulta/tous les symboles, sauf les traits d'union, sont omis -->
<h2 id="bonjour-le-monde">Bonjour le monde !^.+*{}[]?</h2>
```

The symbols being omitted from Markdown heading's `id`

- parenthèses () <> {} []
- période .
- plus +
- astérisque *
- slush /
- back slush \
- circonflexe ^
- dollar $
- ligne verticale |
- question ?
- apostrophe '
- guillemet anglais "
- deux-points :
- point-virgule ;
- tilde ~
- virgule ,
- égale =
- arrobe @
- accent grave `
- dièse #
- exclamation !
- percent %
- perluète &

Si j'ai oublié d'autres, faites-le moi savoir🙇‍♀️

Comme `marked.lexer()` laisse toutes les chaînes de caractères telles quelles, il faut les reformater avec `replace()` pour qu'elles deviennent identiques à `id`.

### pour Next.js

Le nom du fichier est à votre discrétion.

<div class="filename">/components/post-toc.js</div>

```js
import Link from 'next/link'
import { marked } from 'marked'

export default function TableOfContents({ content }) {
  const tokens = marked.lexer(content)
  const headings = tokens.filter((token, i) => token.type === 'heading')

  return (
    <aside>
      <nav>
        <h2>Table des matières</h2>
        <ul>
          {headings.map((heading, i) => (
            <li key={i} data-depth={heading.depth}>
              <Link
                href={`#${heading.text
                  .replace(/ /g, '-')
                  .replace(/[\/\\^$*+?.()|\[\]{}<>:;"'~,=@`#!%&]/g, '')
                  .toLowerCase()}`}
              >
                <a>{heading.text}</a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
```

### pour Gatsby.js

Bien que j'ai écrit le code comme celui de l'officiel Gatsby.js', bien sûr `function` est correct. Le nom du fichier peut aussi être quelconque.

<div class="filename">/src/components/post-toc.js</div>

```js
import { Link } from "gatsby"
import { marked } from "marked"

const TableOfContents = ({ content }) => {
  const tokens = marked.lexer(content)
  const headings = tokens.filter((token, i) => token.type === "heading")

  return (
    <aside>
      <nav>
        <h2>Table des Matières</h2>
        <ul>
          {headings.map((heading, i) => (
            <li key={i} data-depth={heading.depth}>
              <Link
                to={`#${heading.text
                  .replace(/ /g, "-")
                  .replace(/[\/\\^$*+?.()|\[\]{}<>:;"'~,=@`#!%&]/g, "")
                  .toLowerCase()}`}
              >
                {heading.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default TableOfContents
```

Comme le code auquel je me réfère, j'ai ajouté `data-depth` pour réaliser les hiérarchies de la liste. Cependant, il pourrait être préférable de générer un autre `<ul>` si la hiérarchie est plus basse pour le SEO (la tâche future).

C'est tout. Il ne reste plus qu'à ajouter le composant TDM au modèle de poste et à lui envoyer le contenu.

```js
<TableOfContent content={votre-contenu-markdown}>
```

## Comment omettre certaines des rubriques de TDM

S'il y a trop de rubriques, vous pourriez vouloir omettre certaines rubriques plus petites de la Table des Matières.

Dans ce cas, ajoutez `<!-- out of toc -->` juste avant les rubriques que vous ne voulez pas afficher dans la TDM *le texte vous appartient.

```md
<!-- out of toc -->
## Texte du titre

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod te
```

Ensuite, lors de la génération du tableau constant de `headings`, ajoutez une condition qui "ramasse le `heading` qui ne suit pas `<!-- out of toc -->` en avant".

<div class="filename">/components/post-toc.js</div>

```js
const headings = tokens.filter((token, i) => token.type === 'heading'
  && tokens[i-1].text !== '\x3C!-- out of toc -->\n' {/* <- ceci */}
)
```

Parce que la parenthèse (ou je devrais l'appeler "moins que") `<` doit être échappée dans le javascript, c'est ``x3C` de code ASCII ici.

## comparaison avec Markdown All in One (plugin VS Code)

[Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one), un plugin VS Code, il a également une fonction d'insertion automatique de la Table des Matières.

Si l'on compare avec ce composant TDM, on peut dire que c'est très différent, car le TDM généré par ce plugin est inclus dans le contenu Markdown lui-même.

Par exemple, si vous insérez le TDM par le plugin tout en haut du contenu Markdown, ses premières phrases sont le TDM.

De plus, les liens vers la rubrique sont parfois cassés.

Si vous êtes intéressé, essayez-le car il est gratuit. Je l'ai essayé, puis désinstallé plus tard😅