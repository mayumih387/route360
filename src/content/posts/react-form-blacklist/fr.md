---
title: Bloquer l'envoi de formulaires par email, mots et IPs dans React
tags:
  - react
date: 2023-09-15
lastmod: 2023-09-15
---

Cet article explique comment empêcher la soumission de formulaires par e-mail, mots et IPs dans React.

Personnellement, j'utilise [getForm](https://getform.io/) et [formspree](https://formspree.io/) comme backends de formulaire, mais ils n'offrent pas de fonction de blocage comme les backends riches (sauf pour les soumissions de spam).

Par conséquent, je crée un fichier de liste noire en local, puis je maintiens le bouton de soumission désactivé lorsqu'un e-mail ou des mots interdits sont inclus dans l'élément input/textarea.

Environnement :

- React 18.2.0

## Fichiers

```tree
src/
├─ components/
│    └─ Form.js
├─ lib/
│    └─ blackList.js
```

## Blocage par e-mail

Voici le code simplifié permettant de bloquer les envois par e-mail.

### Le code

<div class="filename">src/components/Form.js</div>

```js
import React, { useState } from "react"
import { blackEmails } from "../lib/blackList"

const Form = () => {
  const [emailIsValid, setEmailIsValid] = useState(false)

  const enableSubmit = emailIsValid

  const emailChangeHandler = (event) => {
    setEmailIsValid(
      !blackEmails.some((email) => event.target.value.includes(email))
    )
  }

  return (
    <form>
      <label htmlFor="email">Email</label>
      <input type="email" id="email" onChange={emailChangeHandler} />
      <button type="submit" disabled={!enableSubmit}>
        Soumettre
      </button>
    </form>
  )
}
```

<div class="filename">src/lib/blackList.js</div>

```js
export const blackEmails = ["aaa@example.com", "@test.com"]
```

### Explications

1. Importer la liste noire dans le composant Form
2. Vérifier si les emails saisis se trouvent dans la liste noire.
3. Seulement si l'email donné n'est pas dans la liste noire, mettre `enableSubmit` à `true`.

Pour vérifier si l'email saisi est inclus dans la liste noire, j'ai utilisé `includes()` de JavaScript.

Lien - [Array.prototype.includes() - JavaScript | MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)

## Blocage par les mots

Ajoutons maintenant une prévention par mots à l'intérieur de la `<textarea>`.

### Le code

<div class="filename">src/components/Form.js</div>

```js
import React, { useState } from "react"
import { blackEmails, blackWords } from "../lib/blackList"

const Form = () => {
  const [emailIsValid, setEmailIsValid] = useState(false)
  const [textIsValid, setTextIsValid] = useState(false)

  const enableSubmit = emailIsValid && textIsValid

  const emailChangeHandler = (event) => {
    setEmailIsValid(
      !blackEmails.some((email) => event.target.value.includes(email))
    )
  }

  const textChangeHandler = (event) => {
    setTextIsValid(
      !blackWords.some((word) => event.target.value.includes(word))
    )
  }

  return (
    <form>
      <label htmlFor="email">Email</label>
      <input type="email" id="email" onChange={emailChangeHandler} />
      <label htmlFor="text">Message</label>
      <textarea id="text" onChange={textChangeHandler} />
      <button type="submit" disabled={!enableSubmit}>
        Soumettre
      </button>
    </form>
  )
}
```

<div class="filename">src/lib/blackList.js</div>

```js
export const blackEmails = ["aaa@example.com", "@test.com"]

export const blackWords = ["wholesale", "sales", "marketing"]
```

## Blocage par IP

En utilisant [la façon d'obtenir l'adresse IP du client dans React](../get-ip-react/), nous pouvons ajouter des blocs d'IP.

Pour obtenir l'adresse IP du client, il faut se connecter à l'API de vérification de l'adresse IP lors du premier rendu. Pour ce faire, importez `useEffect` de React.

### Le code

<div class="filename">src/components/Form.js</div>

```js
import React, { useState, useEffect } from "react"
import { blackEmails, blackIps } from "../lib/blackList"

const Form = () => {
  const [emailIsValid, setEmailIsValid] = useState(false)
  const [ip, setIp] = useState()

  const ipIsValid =
    ip && !blackIps.some((ip) => event.target.value.includes(ip))

  const enableSubmit = emailIsValid && ipIsValid

  const emailChangeHandler = (event) => {
    setEmailIsValid(
      !blackEmails.some((email) => event.target.value.includes(email))
    )
  }

  const getIp = async () => {
    // Se connecter à ipapi.co
    const response = await fetch("https://ipapi.co/json/")
    const data = await response.json()
    // Définir l'ip à `ip`
    setIp(data.ip)
  }

  // Exécuter `getIP` sur le premier rendu
  useEffect(() => {
    getIp()
  }, [])

  return (
    <form>
      <label htmlFor="email">Email</label>
      <input type="email" id="email" onChange={emailChangeHandler} />
      <button type="submit" disabled={!enableSubmit}>
        Soumettre
      </button>
    </form>
  )
}
```

<div class="filename">src/lib/blackList.js</div>

```js
export const blackEmails = ["aaa@example.com", "@test.com"]

export const blackIps = ["123.456.789.01", "234.567.890.12"]
```

Bien sûr, vous pouvez vous connecter à d'autres API au lieu d'ipapi.co qui ne nécessitent pas d'enregistrement. Il faut juste faire attention aux éléments de réponse, car ils peuvent être différents dans les autres API.

De plus, dans la réalité, il serait préférable d'obtenir l'IP lorsque le reCaptcha est passé ou à d'autres moments, car l'usage sera consommé si vous obtenez l'IP à chaque fois que vous effectuez les premiers rendus.

C'est tout.
