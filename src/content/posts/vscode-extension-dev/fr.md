---
title: Comment installer une extension VS Code à partir des branches de développement GitHub
tags:
  - vscode
date: 2023-07-27
lastmod: 2023-07-27
draft: false
---

Cette billet est ma note sur la façon d'installer une extension VS Code dans une branche de développement en cours.

## Aperçu

1. Télécharger la branche du dépôt GitHub dans votre environnement local.
2. Installer vsce.
3. Lancer `vsce package` et empaqueter le projet dans un fichier VSIX pour le rendre installable.
4. Installer l'extension à partir du fichier VSIX créé à l'étape 3.

## Télécharger la branche du dépôt GitHub dans votre environnement local

Comme je voulais soumettre des pull requests, j'ai forké le dépôt officiel sur mon compte et je l'ai ensuite importé dans mon environnement local.

Faites un check out vers la branche sur laquelle vous voulez travailler.

Ensuite, lancez `npm install` pour installer tous les paquets nécessaires.

## Installer vsce

Au lieu d'installer une extension du marché, nous pouvons utiliser un fichier VSIX pour empaqueter le projet.

Pour empaqueter un fichier VSIX, utilisez le module [@vscode/vsce](https://github.com/microsoft/vscode-vsce), un gestionnaire d'extensions VS Code fourni par Microsoft.

```bash
#npm
npm install -g @vscode/vsce
```

Lien [Publishing Extensions | Visual Studio Code Extension API](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## Lancer vsce package

Exécutez le code suivant sur le terminal.

```bash
vsce package
```

Cela peut prendre un certain temps, en fonction de la taille du projet. Une fois l'opération terminée, vous trouverez un fichier vsix nouvellement créé.

## Installer l'extension à partir du fichier VSIX

Il ne reste plus qu'à installer l'extension via `Install from VSIX...` dans le menu "..." de l'extension.

![VS Code extension menu](../../../images/vscode01.en.png)

Ne mettez pas l'extension à jour sans précaution, car elle met à jour la dernière version officiellement publiée. Dans ce cas, réinstallez votre version de développement à partir du fichier VSIX.

C'est tout.
