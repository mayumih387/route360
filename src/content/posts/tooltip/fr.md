---
title: Comment créer un composant d'infobulle (tooltip) dans React
tags:
  - react
date: 2023-08-09
lastmod: 2023-08-09
draft: false
---

Ce article est à propos de comment faire un component Tooltip dans React.js.

C'est possible à utiliser un composant UI ou une bibliothèque pour Tooltip, mais je préfère personnellement créer des choses par moi-même à installer facilement quelques choses de l'extérieur.

- [Demo](https://starlit-lollipop-635291.netlify.app/demo/tooltip-demo)
- [Code (GitHub)](https://github.com/mayumih387/demo-nextjs/blob/main/pages/demo/tooltip-demo.js)

On va utiliser `useState()` comme un React Hook.

## Le Code Final

\*Pour le CSS (Tooltip.module.css), voir la deuxième partie de cet article.

<div class="filename">/component/Tooltip.js</div>

```js
import { useState } from "react"
import styles from "../components/Tooltip.module.css"

const Tooltip = props => {
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false)

  const tooltipHandler = () => {
    setTooltipIsOpen(prevState => !prevState)
  }
  const closeTooltipHandler = () => {
    setTooltipIsOpen(false)
  }

  return (
    <>
      <button
        className={styles.tooltipButton}
        onClick={tooltipHandler}
        onBlur={closeTooltipHandler}
        type="button"
      >
        {props.buttonName}
      </button>
      {/* tooltip itself */}
      {tooltipIsOpen && <div className={styles.tooltip}>{props.children}</div>}
    </>
  )
}

export default Tooltip
```

<div class="filename">/pages/demo/tooltip-demo.js</div>

```js
import Tooltip from "../../components/Tooltip"

const TooltipDemo = () => {
  return <Tooltip buttonName="I am a button!">I am inside Tooltip!</Tooltip>
}

export default TooltipDemo
```

Les explications suivent.

## Faire un element de button qui affiche le Tooltip à clicker

D'abord, créez Tooltip.js sous le répertoire des composants.

<div class="filename">/component/Tooltip.js</div>

```js
const Tooltip = props => {
  return (
    <>
      <button type="button">{props.buttonName}</button>
      {/* tooltip itself */}
      <div>{props.children}</div>
    </>
  )
}

export default Tooltip
```

Ici, on a besoin de `<button>` qui est cliquable.

(Note) Puisque `<div>` ou autres quelques éléments ne sont pas cliquables, il n'est pas recommandé de point de vue d’accessibilité. Juste utilisez `<button>` comme vous pouvez modifier l'apparence avec CSS autant que vous voulez.

Afin de généraliser ce Tooltip, faire ce composant recevoir le texte de bouton et le contenu de tooltip avec `props`.

Dans cet exemple, il reçoit `buttonName` comme le texte de bouton et `children` comme le contenu de tooltip.

## Afficher le bouton dans le front-end

Parce que ce [demo](https://starlit-lollipop-635291.netlify.app/demo/tooltip-demo) est établi sur Next.js, j'ai placé la page dans le répertoire `/pages/demo/`.

Si vous utilisez Gatsby.js ou un autre architecture, modifiez les noms de répertoire.

<div class="filename">/pages/demo/tooltip-demo.js</div>

```js
import Tooltip from "../../components/Tooltip"

const TooltipDemo = () => {
  return <Tooltip buttonName="I am a button!">I am inside Tooltip!</Tooltip>
}

export default TooltipDemo
```

Afin de passer les donnés au composant Tooltip, ce `<Tooltip>` a la propriété `buttonName` comme texte de bouton et `I am inside Tooltip!` comme contenu de Tooltip.

Grâce à cela, le composant Tooltip pourra recevoir les donnés par `props`.

En ce moment, tous les deux (le bouton et le contenu de tooltip) sont affichés en même temps sur l'écran.

## Ajouter l'état de tooltip dans le composant de Tooltip

Maintenant, ajouter l'état de "afficher/cacher" du contenu de tooltip au composant Tooltip. On utilise `useState()` ici.

L'état par défaut de `tooltipIsOpen` est `false`. Faire le contenu de tooltip s'afficher seulement quand l'état devient `true`".

<div class="filename">/component/Tooltip.js</div>

```js
import { useState } from "react"

const Tooltip = props => {
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false)

  return (
    <>
      <button type="button">{props.buttonName}</button>
      {/* tooltip itself */}
      {tooltipIsOpen && <div>{props.children}</div>}
    </>
  )
}

export default Tooltip
```

Si vous utilisez Gatsby.js, une erreur "`'React' must be in scope when using JSX`" peut être émise. En ce cas-là, changez la première ligne ci-dessus comme ci-dessous et importez React lui-même.

```js
import React, { useState } from "react"
```

Essayez de changer `useState` à `true` or à `false`. Vous allez voir le contenu de tooltip est affiché ou masqué sur le frontend.

## Créer un gestionnaire sur le bouton pour afficher/cacher le contenu de tooltip

Maintenant, créer un gestionnaire à afficher/cacher le contenu de tooltip quand le bouton est cliqué.

<div class="filename">/component/Tooltip.js</div>

```js
import { useState } from "react"

const Tooltip = props => {
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false)

  const tooltipHandler = () => {
    setTooltipIsOpen(prevState => !prevState)
  }

  return (
    <>
      <button type="button" onClick={tooltipHandler}>
        {props.buttonName}
      </button>
      {/* tooltip itself */}
      {tooltipIsOpen && <div>{props.children}</div>}
    </>
  )
}

export default Tooltip
```

Avec l'attribut `onClick` sur l'élément bouton, `tooltipHandler` s'exécute quand il est cliqué.

`tooltipHandler` marche comme suivant;

- Quand `tooltipIsOpen` est `false`, il change l'état à `true`
- Quand `tooltipIsOpen` est `true`, il change l'état à `false`

On peut dire que c'est comme un interrupteur.

Essayez de cliquer le bouton quelques fois. Vous allez voir le contenu de tooltip s'affiche et se cache.

## Créer un autre gestionnaire sur le bouton pour cacher le contenu de tooltip par un clic quelque part sur l'écran

Vous peut-être pensez que c'est plus util si le contenu de tooltip se cache quand quelque part sur l'écran est cliqué. Ce n'est pas difficile!

Il suffit d'ajouter l'attribut `onBlur` et un gestionnaire sur l'élément du bouton. Puis, quand la mise au point est terminée, faire le contenu de tooltip se cacher (= faire de `tooltipIsOpen` un état `false`).

<div class="filename">/component/Tooltip.js</div>

```js
import { useState } from "react"

const Tooltip = props => {
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false)

  const tooltipHandler = () => {
    setTooltipIsOpen(prevState => !prevState)
  }

  const closeTooltipHandler = () => {
    setTooltipIsOpen(false)
  }

  return (
    <>
      <button
        onClick={tooltipHandler}
        onBlur={closeTooltipHandler}
        type="button"
      >
        {props.buttonName}
      </button>
      {/* tooltip itself */}
      {tooltipIsOpen && <div>{props.children}</div>}
    </>
  )
}

export default Tooltip
```

Qu'une ligne de `setTooltipIsOpen(false)`, c'est tout!

## Faire le module CSS

Dans cet example, j'utilise le module CSS pour le stylisme. J'ai placé le fichier dans le répertoire des composants (comme Tooltip.js), mais c'est à vous de décider. Vous pouvez utiliser le répertoire de "styles" aussi.

Le stylisme ci-dessous n'est qu'un exemple.

<div class="filename">/component/Tooltip.module.css</div>

```css
.tooltipButton {
  position: relative;
}

.tooltip {
  position: absolute;
  top: 2em;
  left: 1em;
  background: #fff;
  margin-top: 0.75rem;
  padding: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
  z-index: 10;
  color: #000;
}

.tooltip::before {
  content: "";
  position: absolute;
  top: -30px;
  left: 50%;
  margin-left: -15px;
  border: 15px solid transparent;
  border-bottom: 15px solid #fff;
}
```

Puis, importer le module CSS sur le composant Tooltip.js.

<div class="filename">/component/Tooltip.js</div>

```js
import styles from "../components/Tooltip.module.css"

const Tooltip = props => {
  //...
}
```

C'est fini!

Le composant Tooltip n'est pas si difficile, même il est très simple. C'est bien pour un pratique et savoir comment vous avez compris le React.js.
