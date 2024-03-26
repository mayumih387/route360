---
title: Comment retourner des chaînes aléatoires lors de la copie de texte pour éviter le vol de contenu dans React
tags:
  - react
date: 2024-03-26
lastmod: 2024-03-26
draft: false
---

Cet article présente un moyen d'empêcher le vol de contenu pour les sites web utilisant le framework React comme NextJS et Gatsby.

Lorsque le contenu est copié, le code renvoie des chaînes aléatoires au lieu du texte lui-même.

Environnement

- React v18.2.0

## Le code pour empêcher la copie de texte dans React

Ajoutez le code suivant dans l'un des composants de premier niveau.

```js
const handleCopy = () => {
  let copiedText = ""
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()"
  for (let i = 0; i < 10 ; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    copiedText += chars[randomIndex]
  }
  navigator.clipboard.writeText(copiedText)
}

return (
  <body onCopy={handleCopy}>
    {children}
  </body>
)
```

## Comment ça marche

Lorsque le contenu est copié, `handleCopy` s'exécute.

Les chaînes aléatoires sont générées dans `for` ; un caractère est sélectionné dans `chars` et ajouté 10 fois à la variable chaîne aléatoire `copiedText`.

Ensuite, `navigator.clipboard.writeText()` renvoie les chaînes aléatoires de 10 caractères dans le presse-papiers de l'utilisateur.

Dans cette entrée, j'ai fixé la longueur des chaînes aléatoires à 10, mais il est possible de la rendre identique à la longueur du texte copié avec `event`. Dans ce cas, il serait préférable de fixer la longueur maximale des chaînes aléatoires.

De plus, bien que le code ci-dessus fonctionne pour tous les éléments sous `<body>`, vous pouvez l'utiliser pour l'élément de contenu principal au lieu du `<body>`.

Malheureusement, il ne peut pas empêcher les robots de scraping. Il ne s'oppose qu'au copier-coller humain.

C'est tout !