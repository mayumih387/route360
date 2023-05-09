---
title: Construire un système de commentaires (+ notation par étoiles) avec Firebase + React + Gatsby
tags:
  - react
  - gatsbyjs
date: 2023-03-18T15:00:00.000Z
lastmod: 2023-04-08T11:29:40.596Z
draft: false
---

Cet article présente mes notes lorsque j'ai créé un système de commentaires pour un site web Gatsby.js avec [Google Firebase](https://firebase.google.com/).

Firebase est une plateforme pour le développement d'applications et vous pouvez y stocker des données de connexion, des données de panier, etc.

La "Realtime Database", une des fonctions de Firebase, peut lire et écrire des données au format json et accéder aux données via des requêtes HTTP javascript, ce qui la rend facile à utiliser pour les systèmes de commentaires.

J'ai créé un système de commentaires avec Firebase Realtime Database pour un site Gatsby, mais si vous concevez la partie affichage, cela devrait également fonctionner pour Next.js.

De plus, comme vous pouvez ajouter n'importe quel element d'`<input>` que vous voulez avec le système de commentaires utilisant Firebase, ce serait bien pour les sites de commerce électronique qui veulent ajouter une fonction d'évaluation (notation par étoiles) à leurs produits.

*Comme je ne suis pas très habitué à Firebase, tout conseil serait apprécié si j'écris quelque chose d'incorrect🙇‍♀️

Environnement :

- Node v18.12.1
- React v18.2.0
- Gatsby v5.7.0 / v4.25.0

## Créer une Realtime Database

Procédez après vous être enregistré auprès de Firebase.

### Ajouter un nouveau projet

Tout d'abord, ajoutez un nouveau projet.

![Ajouter un nouveau projet sur Firebase](../../../images/firebase01.fr.png '&copy; Google Firebase')

Le nom du projet est libre. Je l'ai appelé "comments".

![Ajouter un nouveau projet sur Firebase](../../../images/firebase02.fr.png '&copy; Google Firebase')

Comme je n'utilise pas Google Analytics cette fois-ci, j'ai désactivé Google Analytics ici.

![Ajouter un nouveau projet sur Firebase](../../../images/firebase03.fr.png '&copy; Google Firebase')

Votre nouveau projet sera prêt dix secondes après avoir cliqué sur "Créer un projet".

### Créer une base de données

Dans votre projet, créez une base de données.

![Créer une base de données en temps réel sur Firebase](../../../images/firebase04.fr.png '&copy; Google Firebase')

Démarrez en mode verrouillé pour vos règles de sécurité afin que personne ne puisse accéder à votre base de données.

![Règles de sécurité sur Firebase](../../../images/firebase05.fr.png '&copy; Google Firebase')

## Préparation de l'accès à la Realtime Database

En général, nous pouvons accéder à la base de données en ajoutant le nom de fichier json à la fin de l'URL de la base de données.

```text
https://[yourproject].firebasedatabase.app/comments.json
```

Cependant, les règles de sécurité strictes par défaut empêchent tout accès, même à partir de l'administrateur. Nous utilisons donc la clé secrète pour l'authentification.

### Vérifier la clé secrète

En haut à gauche de l'icône ⚙️, allez dans "Paramètres du projet" -> "Comptes de service", puis dans l'onglet "Codes secrets de la base de données". Vous y trouverez votre clé secrète.

![Codes secrets de la base de données de la Realtime Database](../../../images/firebase06.fr.png '&copy; Google Firebase')

Cette clé secrète, ajoutée à la fin de l'URL de la base de données, permet d'accéder à l'API REST.

```js
fetch(`https://[yourproject].firebasedatabase.app/comments.json?auth=[secret]`)
```

Cependant, les clés secrètes sont considérées comme héritées sur Google Firebase, et il est recommandé d'utiliser le SDK Admin Firebase pour obtenir un jeton d'accès à la place.

Les jetons d'accès (Google OAuth2 access tokens) peuvent être générés à l'aide de l'une des [bibliothèques client Google API](https://developers.google.com/api-client-library/)* en transmettant un fichier json de clé privée de la base de données. *Celle pour Node.js serait plus facile pour les utilisateurs de React.

D'autre part, les jetons d'accès expirent après une courte période de temps. Cela signifie que vous devez générer un nouveau jeton d'accès pour chaque construction. Essayez-le si vous êtes motivé.

<span class="label warning">Référence</span> [Authenticate REST Requests | Firebase Realtime Database](https://firebase.google.com/docs/database/rest/auth)

## Créer un composant de formulaire de commentaire

Le code suivant est l'exemple le plus simple ; j'ai omis les validations de formulaire, une fenêtre modale ou un défi captcha. Ajoutez-les si nécessaire.

De plus, comme j'ai construit ce composant pour un site Gatsby, j'ai ajouté `GATSBY_FIREBASE_TOKEN` comme variable d'environnement.

*Puisque la soumission du formulaire de commentaire fonctionne côté client, nous devons ajouter le préfixe `GATSBY_` pour Gatsby ou `NEXT_` pour les sites Next.js.

<div class="filename">/src/components/commentForm.js</div>

```jsx
import React, { useState } from "react"

const CommentForm = (props) => {
  const [enteredRating, setEnteredRating] = useState("")
  const [enteredComment, setEnteredComment] = useState("")
  const [enteredName, setEnteredName] = useState("")
  const [enteredEmail, setEnteredEmail] = useState("")

  const submitHandler = (event) => {
    event.preventDefault()
    const dburl = `https://[yourproject].firebasedatabase.app/comments.json?auth=${process.env.GATSBY_FIREBASE_TOKEN}`

    const response = await fetch(dbUrl, {
      method: "POST",
      body: JSON.stringify({
        slug: props.slug, // post slug
        name: enteredName,
        email: enteredEmail,
        rating: Number(enteredRating),
        comment: `<p>${enteredComment
          .replaceAll("\n\n", "</p><p>")
          .replaceAll("\n", "<br />")}</p>`,
        date: new Date().toISOString(),
        approved: false,
      }),
    })

    if (!response.ok) {
      return
    }

    setEnteredRating("")
    setEnteredComment("")
    setEnteredName("")
    setEnteredEmail("")
  }

  return (
    <form id="commentform" onSubmit={submitHandler}>
      <label htmlFor="rating">
        Rating
        <fieldset id="rating">
          <input
            type="radio"
            id="p-rating_5"
            name="rating"
            defaultValue={5}
            checked={enteredRating === "5"}
            required
          />
          <label htmlFor="p-rating_5">5</label>
          <input
            type="radio"
            id="p-rating_4"
            name="rating"
            defaultValue={4}
            checked={enteredRating === "4"}
          />
          <label htmlFor="p-rating_4">4</label>
          <input
            type="radio"
            id="p-rating_3"
            name="rating"
            defaultValue={3}
            checked={enteredRating === "3"}
          />
          <label htmlFor="p-rating_3">3</label>
          <input
            type="radio"
            id="p-rating_2"
            name="rating"
            defaultValue={2}
            checked={enteredRating === "2"}
          />
          <label htmlFor="p-rating_2">2</label>
          <input
            type="radio"
            id="p-rating_1"
            name="rating"
            defaultValue={1}
            checked={enteredRating === "1"}
          />
          <label htmlFor="p-rating_1">1</label>
        </fieldset>
      </label>
      <label htmlFor="comment">
        Comment
        <textarea
          id="comment"
          name="comment"
          maxLength={1000}
          required
          value={enteredComment}
        />
      </label>
      <label htmlFor="author">
        Your name
        <input
          id="author"
          name="name"
          type="text"
          required
          value={enteredName}
        />
      </label>
      <label htmlFor="email">
        Your e-mail
        <input
          id="email"
          name="email"
          type="email"
          required
          value={enteredEmail}
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  )
}

export default CommentForm
```

### Points du code ci-dessus

1. Utiliser `useState` pour obtenir les valeurs d'entrée.
2. Récupérer le `slug` de la page unique par le biais de `props`.
3. Envoyer les valeurs d'entrée avec la clé body à la base de données en temps réel avec `submitHandler` lors de la soumission du formulaire.
4. Envoyer la clé `approved` (par défaut `false`) en même temps, pour que nous puissions revoir les commentaires avant qu'ils ne soient affichés.
5. Réinitialiser toutes les valeurs d'entrée après la soumission.

Il n'y a rien de très difficile, juste `useState` et un gestionnaire de soumission, qui sont les bases de React.

Dans la plupart des cas pratiques, beaucoup de choses seraient nécessaires, comme des validations d'entrée, un défi captcha, une fonction modale après la soumission d'un commentaire, etc.

Dans le modèle de page unique, passez la page `slug' au composant afin que nous sachions à quelle page le commentaire a été soumis.

<div class="filename">/src/templates/singlePage.js</div>

```js
import React from 'react'
import CommentForm from '../components/commentForm'
...

const SinglePage = () => {
  ...
  return (
    ...
    <CommentForm slug={`your post slug`} />
    ...
  )
}

export default SinglePage
```

## Récupérer les commentaires de la base de données

Cette fois-ci, j'utilise Gatsby.js comme framework frontal.

Gatsby.js nous permet de générer un nouveau schéma GraphQL en ajoutant du code à `gatsby-node.js`.

Ainsi, nous n'enverrons pas de requête HTTP dans le template de la page unique, mais nous ajouterons du code pour générer un schéma de commentaires dans `gatsby develop` ou `gatsby build`.

### Ajouter un schéma de commentaires à GraphQL

<div class="filename">gatsby-node.js</div>

```js
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

const fetch = require("node-fetch")

exports.sourceNodes = async ({
  actions: { createNode },
  createContentDigest,
  createNodeId,
}) => {
  const response = await fetch(
    `https://[yourproject].firebasedatabase.app/comments.json?auth=${process.env.FIREBASE_TOKEN}`
  )
  const data = await response.json()

  Object.entries(data).map(([key, value]) => {
    value.approved && // Si "approved" est vrai
      createNode({
        id: key,
        date: value.date,
        name: value.name,
        comment: value.comment,
        rating: value.rating,
        slug: value.slug,
        parent: null,
        children: [],
        internal: {
          type: "Comments",
          contentDigest: createContentDigest(value),
        },
      })
  })
}
```

Après avoir ajouté le code ci-dessus à `gatsb-node.js`, lancez `gatsby develop`. Vous pouvez voir les données des commentaires sur le GraphQL.

![GraphQL sur Gatsby.js](../../../images/graphql01.png)

Dans ce cas, l'email n'est pas reflété dans GraphQL à des fins d'affichage. Nous pouvons gagner du temps de construction en ne générant pas de schémas inutiles.

### Ajouter des arguments de formatage de date

D'après mon expérience, Gatsby v4 active automatiquement les arguments de formatage de la date, mais Gatsby v5 ne le fait pas.

Si vous voulez ajouter des arguments de formatage de date à la valeur de la date du commentaire, ajoutez le code suivant à `gatsby-node.js`.

<div class="filename">gatsby-node.js</div>

```js
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
  type Comments implements Node {
    date: Date @dateformat
  }
  `
  createTypes(typeDefs)
}
```

Les arguments de formatage de date sont alors disponibles.

![GraphQL sur Gatsby.js](../../../images/graphql02.png)

### Relier les commentaires et les articles

En outre, si un schéma de commentaires est associé à chaque article, les numéros de commentaires ou les notes en étoiles peuvent être affichés sur les pages d'archives. L'élément commun entre les posts et les commentaires est le slug, donc chaque `slug` correspondant devrait être lié ensemble.

Il existe plusieurs fonctions pour connecter deux schémas, j'ai utilisé [createResolvers](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#createResolvers) dans ce cas.

*Voici un exemple où le contenu du site est géré en Markdown. Si vous utilisez un CMS headless, remplacez `MarkdownRemark` ou le filtre par ceux qui conviennent.

<div class="filename">gatsby-node.js</div>

```js
exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {
    MarkdownRemark: {
      comments: {
        type: ["Comments"],
        resolve: async (source, args, context, info) => {
          const { comments } = await context.nodeModel.findAll({
            query: {
              filter: {
                slug: { eq: source.frontmatter.slug },
              },
            },
            type: "Comments",
          })
          return comments
        },
      },
    },
  }
  createResolvers(resolvers)
}
```

Lancez `gatsby develop` après avoir ajouté le code ci-dessus. Vous devriez maintenant voir des commentaires à l'intérieur du schéma de l'article.

![GraphQL sur Gatsby.js](../../../images/graphql03.png)

## Migration des commentaires depuis votre système de commentaires actuel

Puisque nous pouvons importer des données json dans la base de données, il est possible de migrer depuis d'autres systèmes de commentaires si vous pouvez préparer les données json des commentaires actuels.

Par exemple, préparez les commentaires actuels comme suit ;

<div class="filename">comments.json</div>

```json
{
  "comments": {
    "0": {
      "date": "2022-08-29T00:00:00:000Z",
      "email": "test0@example.com",
      "comments": "<p>Il est super!</p>",
      "name": "Pierre",
      "rating": 4,
      "slug": "honey00",
      "approved": true
    },
    "1": {
      "date": "2023-01-30T00:00:00:000Z",
      "email": "test1@example.com",
      "comments": "<p>J'aime ça!</p>",
      "name": "Thomas",
      "rating": 5,
      "slug": "flower01",
      "approved": true
    }
  }
}
```

Pour importer vos données json, allez sur la page d'accueil de la base de données et cliquez sur l'icône à trois points.

![Importer un fichier json dans la Realtime Database](../../../images/firebase07.fr.png '&copy; Google Firebase')

## Conlcusion (et autres choses à faire)

Ce n'est qu'une idée si vous n'êtes pas satisfait de Disqus ou d'autres systèmes de commentaires.

Comme ces codes ne contiennent que des fonctions de base, il y a encore beaucoup à faire avant le lancement ;

- [Obtenir l'IP du client](/posts/get-ip-react/)
- Défi Captcha
- [Validation de l'e-mail](/posts/email-validation/)
- Notification des nouveaux commentaires
- Ajouter un bouton "J'aime" à chaque commentaire
- Ajouter un système de réponse

De plus, dans ce cas, nous devons approuver chaque commentaire sur Firebase à la main. Vous pouvez développer une autre page d'interface utilisateur pour les commentaires si vous trouvez cela fastidieux.

J'ai personnellement utilisé [Yotpo](https://www.yotpo.com/) comme système d'évaluation. Il existe d'autres services de système d'évaluation (ils proposent généralement une formule gratuite). Il serait beaucoup plus facile de les envisager si vous n'êtes pas aussi motivé pour développer votre propre système d'évaluation.