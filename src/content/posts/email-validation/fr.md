---
title: Intégrer la validation des e-mails par l'API abstraite à un formulaire [React]
tags:
  - react
date: 2022-11-05T01:00:00.000Z
lastmod: 2022-11-15T02:27:40.793Z
draft: false
---

Pour éviter que votre formulaire de commentaire ou de contact ne soit pollué, nous pouvons utiliser des services API de validation qui vérifient si l'adresse e-mail saisie existe ou non.

Comme ces API peuvent vérifier les e-mails en temps réel, vous pouvez réduire considérablement le spam en activant le bouton d'envoi au moment où l'e-mail est validé.

- [demo](https://starlit-lollipop-635291.netlify.app/demo/email-demo)
- [code (GitHub)](https://github.com/mayumih387/demo-nextjs/blob/main/pages/demo/email-demo.js)

*La démo ci-dessus peut vérifier 100 e-mails par mois (version gratuit). Si elle ne fonctionne pas, elle peut dépasser cette limite.

React Hook à utiliser: `useState()` and `useRef()`

Environnement de fonctionnement :

- Node.js v18.12.1
- React v18.2.0

## S'inscrire à l'API

https://www.abstractapi.com/

Cette fois, nous allons utiliser [Abstract API](https://www.abstractapi.com/api/email-verification-validation-api).

La version gratuite comprend 100 validations par mois. C'est suffisant pour un blog personnel.

## Créer un composant de formulaire

J'ajouterais une fonction de validation dans un composant de formulaire, juste pour l'explication. Il est préférable que la fonction de validation soit séparée comme un autre composant.

### Le formulaire

<div class="filename">/components/form.js</div>

```js
const Form = () => {
  return (
    <form>
      <input
        id="email"
        name="email"
        type="email"
        required
      />
    </form>
  )
}

export default Form
```

### Obtenir la valeur de l'entrée e-mail

Avec `useRef()`, récupérer la valeur saisie dans le formulaire.

<div class="filename">/components/form.js</div>

```js
import { useRef } from "react"

const Form = () => {
  const emailRef = useRef()
  return (
    <form>
      <input
        id="email"
        name="email"
        type="email"
        required
        ref={emailRef}
      />
    </form>
  )
}

export default Form
```

Vous pouvez obtenir la valeur avec `emailRef.current.value`.

### Une constante pour juger si la valeur est le format e-mail

Pour éviter les validations inutiles, préparez une constante du format de l'e-mail et faites en sorte que la fonction ne fonctionne que lorsque la valeur d'entrée la respecte.

```js
const pattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/
```

### Faire fonctionner la fonction lorsque la mise au point est floue

#### Ajouter un état

Avec `useState()`, ajouter une constante de;

- `emailIsValid`: si la valeur saisie (= e-mail) est valide ou non (par défaut `false`)

Seulement quand l'e-mail entré est valide, faites l'état `true`. *On le fera plus tard.

<div class="filename">/components/form.js</div>

```js
import { useRef, useState } from "react"
//...

const Form = () => {
  const emailRef = useRef()
  const [emailIsValid, setEmailIsValid] = useState(false)
  //...
  return {
    //...
  }
}
```

#### Ajouter un gestionnaire

Maintenant, ajoutons un gestionnaire pour juger de l'e-mail saisi lorsque le focus est flouté de la balise `input`. Il s'agit d'un événement `onBlur` à utiliser.

De plus, il faut que le gestionnaire ne fonctionne que lorsque la valeur saisie correspond à la constante `pattern` afin d'éviter des validations inutiles.

Par `emailRef` défini avec un React Hook `useRef()`, vous pouvez obtenir la valeur actuelle comme `emailRef.current.value`. Vérifiez donc si la valeur correspond à la constante `pattern` en utilisant la méthode `test()` de javascript.

Traduit avec www.DeepL.com/Translator (version gratuite)

```js
pattern.test(emailRef.current.value)
```

<span class="label warning">Référence</span> [RegExp.prototype.test() - JavaScript - MDN Web Docs - Mozilla](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test)

Le nom du gestionnaire ci-dessous est à votre choix. `async` est ajouté à cause de la communication asynchrone avec l'API.

<div class="filename">/components/form.js</div>

```js
import { useRef, useState } from "react"
const pattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/

const Form = () => {
  //...

  const emailCheckHandler = async () => {
    if (pattern.test(emailRef)) {
      // défi de validation ici

      if () { // lorsqu'il est passé
        setEmailIsValid(true)
      } else { // lorsqu'il a échoué
        setEmailIsValid(false)
      }
    }
  }

  return (
    <form>
      <input
        id="email"
        name="email"
        type="email"
        required
        ref={emailRef}
        onBlur={emailCheckHandler}
      />
    </form>
  )
}

export default Form
```

#### Défi de validation avec l'API abstraite

Utilisez maintenant `fetch()` pour vous connecter à l'API abstraite.

Avec l'API abstraite, le résultat de la validation est renvoyé sur l'URL suivante ;

```html
https://emailvalidation.abstractapi.com/v1/?api_key=[API_KEY]&email=[EMAIL_TO_VALIDATE]
```

Les étapes pour obtenir la réponse :

```js
const url = "https://emailvalidation.abstractapi.com/v1/?api_key=[API_KEY]&email=[EMAIL_TO_VALIDATE]"
const response = await fetch(url)
const data = await response.json()
```

La réponse elle-même peut être visible avec `console.log(data)` ;

```js
{
  "email": "eric@abstractapi.com",
  "autocorrect": "",
  "deliverability": "DELIVERABLE",
  "quality_score": "0.80",
  "is_valid_format": {
    "value": true,
    "text": "TRUE"
  },
  "is_free_email": {
    "value": false,
    "text": "FALSE"
  },
  "is_disposable_email": {
    "value": false,
    "text": "FALSE"
  },
  "is_role_email": {
    "value": false,
    "text": "FALSE"
  },
  "is_catchall_email": {
    "value": true,
    "text": "TRUE"
  },
  "is_mx_found": {
    "value": true,
    "text": "TRUE"
  },
  "is_smtp_valid": {
    "value": true,
    "text": "TRUE"
  }
}
```

La validation de l'e-mail par l'API abstraite est donnée par `quality_score` entre 0.01 et 0.99.

Comme je mets la réponse dans la constante `data` ci-dessus, le score peut être récupéré avec `data.quality_score`.

Dans mon environnement, il retourne 0.7 pour une adresse Gmail. Essayez simplement avec quelques adresses e-mail et trouvez votre point où le défi peut passer.

Le gestionnaire de contrôle serait comme le suivant. N'exposez pas votre clé API mais gardez-la dans `.env`.

<div class="filename">/components/form.js</div>

```js
  const emailCheckHandler = async () => {
    if (pattern.test(emailRef.current.value)) {
      const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&email=${emailRef.current.value}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.quality_score >= 0.7) {// OK
        setEmailIsValid(true)
      } else {// échec
        setEmailIsValid(false)
      }
    }
  }
```

Étant donné que la clé API doit fonctionner côté client, vous devrez ajouter un préfixe dans le cas de Next.js ou Gatsby.js ;

<div class="filename">.env</div>

```bash
# Next.js
NEXT_PUBLIC_ABSTRACT_API=xxxxxxxxxxxxxxxxx

# Gatsby.js
GATSBY_ABSTRACT_API=xxxxxxxxxxxxxxxxx
```
## Le code

<div class="filename">/components/form.js</div>

```js
import { useRef, useState } from "react"

const pattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/
const Form = () => {
  const emailRef = useRef()
  const [emailIsValid, setEmailIsValid] = useState(false)

  const emailCheckHandler = async () => {
    if (pattern.test(emailRef.current.value)) {
      const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API}&email=${emailRef.current.value}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.quality_score >= 0.7) {
        setEmailIsValid(true)
      } else {
        setEmailIsValid(false)
      }
    }
  }

  return (
    <form>
      <input
        id="email"
        name="email"
        type="email"
        required
        ref={emailRef}
        onBlur={emailCheckHandler}
      />
    </form>
  )
}

export default Form
```

## Rendre le formulaire plus pratique

Le formulaire serait plus sécurisé avec reCaptcha, etc.

- Intégration de reCaptcha ou hCaptcha (sécurité)
- Activer le bouton "submit" après la validation de l'e-mail et le challenge reCaptcha (sécurité)
- Afficher un spinner pendant la validation de l'e-mail (UX)

Il y a d'autres points à prendre en compte concernant le formulaire. [Abstract official guidance](https://www.abstractapi.com/guides/react-form-validation#react-hook-form-validation) lui serait utile.

C'est tout !