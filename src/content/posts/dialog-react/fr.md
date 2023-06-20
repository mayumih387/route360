---
title: Comment créer une fenêtre modale avec l'élément dialog en React
tags:
  - react
date: 2023-06-20
lastmod: 2023-06-20
draft: false
---

Comme tout le monde le sait, les dernières versions de HTML et CSS nous permettent de réaliser des expressions de type javascript.

Aujourd'hui, j'aimerais vous montrer comment faire fonctionner un élément HTML `<dialog>` comme une fenêtre modale dans React.

Dans React, nous devons généralement utiliser `useState` pour afficher et cacher une fenêtre modale.

Si vous le remplacez par `<dialog>`, vous n'avez pas besoin de `useState` pour cela et vous pouvez réduire un état. Aucune fenêtre modale n'est alors nécessaire.

Environnement

- React v18.2.0

## Le Code

```js
import React, { useRef } from "React"

const Dialog = () => {
  const dialog = useRef()

  const openHandler = () => {
    dialog.current.showModal()
  }

  const closeHandler = () => {
    dialog.current.close()
  }

  return (
    <>
      <dialog ref={dialog}>
        <p>Je suis le dialogue</p>
        <button onClick={closeHandler} type="button">
          Fermer
        </button>
      </dialog>
      <button type="button" onClick={openHandler}>
        Ouvrir le dialogue
      </button>
    </>
  )
}

export default Dialog
```

## Clés

- Contrôler l'élément de dialogue avec `useRef()`
- Styliser le CSS d'arrière-plan avec `::backdrop`

Dans le code ci-dessus, j'ai ajouté un gestionnaire à un élément bouton. Il est également possible d'afficher le dialogue avec `onSubmit` d'un élément de formulaire, de sorte que nous puissions afficher le message `Votre message a été envoyé.

### Exemple d'affichage d'une boîte de dialogue après l'envoi d'un formulaire

```js
import React, { useRef } from "React"

const Form = () => {
  const dialog = useRef()

  const submitHandler = (event) => {
    event.preventDefault()
    // ...
    // fetch ou fonctions d'envoi d'éléments...
    // ...
    dialog.current.showModal()
  }

  const closeHandler = () => {
    dialog.current.close()
  }

  return (
    <>
      <dialog ref={dialog}>
        <p>Votre message a bien été envoyé.</p>
        <button onClick={closeHandler} type="button">
          Fermer
        </button>
      </dialog>
      <form onSubmit={submitHandler}>
        <input type="text">
        <button type="submit" onClick={submitHandler}>
          Soumettre
        </button>
      </form>
    </>
  )
}

export default Form
```

Normally we use a lot of `useState` for a form component, but in the code above I omitted them for an example of a dialog.

With this kind of dialog, we don't need to prepare a thank you page after submission.

If you want to use the dialog as a custom component, use `forwardRef` to control `ref`.

## Inconvénients des éléments de boîte de dialogue

Après avoir remplacé certains de mes composants modaux par des éléments de dialogue, j'ai le sentiment que les éléments de dialogue ont des inconvénients ; tous les éléments sont inclus dans le premier arbre DOM malgré la fonction show/hide de React.

Un composant modal contrôlé par React state ne sera pas inclus la première fois que la page est chargée. Cependant, un élément de dialogue est déjà inclus et chargé dès le premier chargement, ce qui peut avoir une incidence sur la vitesse de la page.

Les éléments de dialogue ne devraient donc être utilisés que pour une petite alerte ou un petit message, je pense.
