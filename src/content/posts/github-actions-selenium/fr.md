---
title: Comment Automatiser la Recherche avec Python 3 + Selenium 4 via GitHub Actions
tags:
  - meilisearch
  - python
date: 2023-06-06
lastmod: 2023-06-06
draft: false
---

Ce billet traite de l'automatisation des actions de recherche avec Python 3 + Selenium 4 sur GitHub Actions.

Si vous utilisez [Meilisearch Cloud](https://www.meilisearch.com/) avec son plan gratuit, vous recevrez une notification par e-mail de la suppression du projet après 3 jours d'inactivité(\*). Il est possible que le système de recherche de votre site web ne soit pas utilisé très souvent. Une recherche automatisée doit être utile pour éviter que le projet ne soit supprimé.

\*Vous disposez encore de 58 heures après avoir reçu le message d'avertissement. L'intervalle de fonctionnement minimum requis est donc de 1 fois tous les 3 jours + 58 heures = 130 heures (5,42 jours).

Environnement:

- Python 3.11
- Selenium 4
- undetected-chromedriver

## Aperçu

La structure du dossier est la suivante ;

```tree
root
├─ .github/
|  └─ workflows/
|     └─ run.yml
├─ search.py
└─ requirements.txt
```

### Aperçu du flux de travail

Définissez l'élément d'entrée `id` comme `id="searchInput"`.

- Exécuter le (1 + 3n)e jour à 0:00 UTC
- Quitter le programme après avoir saisi "a" dans l'élément d'entrée "search".
- Décrire les dépendances dans le fichier requirements.txt

### Programme Python lui-même

- Utiliser [undetected_chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver) pour éviter l'anti-bot du WAF du serveur.

## Code

<div class="filename">.github/workflows/run.yml</div>

```yml
name: Run Python script on schedule
on:
  schedule:
    - cron: "0 15 1,4,7,10,13,16,19,22,25,28,31 * *"
  # workflow_dispatch: <- Ajouter pour l'exécution manuelle

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Set up Python environment
        uses: actions/setup-python@v4
        with:
          python-version: 3.11
      - name: Cache pip dependencies
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
          restore-keys: |
            ${{ runner.os }}-pip-
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run Python script
        run: python search.py
```

<div class="filename">search.py</div>

```py
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

options = uc.ChromeOptions()
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--headless')
# specify driver version
driver = uc.Chrome(options=options, version_main=113)

# Si l'élément n'est pas trouvé, attendre 5 secondes
driver.implicitly_wait(5)
# Attendre 5 secondes pour que l'élément prenne effet
wait = WebDriverWait(driver, 5)

# Le site à rechercher
driver.get("https://example.com/")

# Obtenir id="searchInput" et l'entrée "a"
input_element = wait.until(EC.presence_of_element_located((By.ID, "searchInput")))
input_element.send_keys("a")
time.sleep(3)

# Fermer webdriver
driver.quit()
```

<div class="filename">requirements.txt</div>

```txt
selenium
undetected-chromedriver
```

## Code Description

### Version du driver

J'ai testé ce code sur GitHub Actions, et je reçois des erreurs à propos de la différence de version entre le driver et le browser, surtout quand le browser a été récemment mis à jour. Ou alors c'est parce que `undetected-chromedriver` fonctionne avec la dernière beta.

J'ai donc spécifié la version du driver lorsque j'obtiens une erreur.

Comme je ne suis pas complètement familier avec Python et les GitHub Actions, j'apprécierais que quelqu'un puisse me fournir un moyen de réconcilier automatiquement les deux versions😅.

### Mesures anti-bots

Le serveur que vous utilisez peut protéger l'accès des robots avec son WAF. Pour éviter cela, j'ai ajouté [undetected_chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver) comme mentionné ci-dessus. Sans cela, Cloudflare a rejeté ce programme.

### Intervalle d'opération

Si vous utilisez ce programme pour le plan gratuit de Meilisearch Cloud, vous avez encore 58 heures après un email d'avertissement. Dans ce programme, je l'exécute le `(1 + 3n)`ème jours parce que je ne veux pas recevoir leur email.

GitHub Actions offre 2 000 minutes d'utilisation gratuite par mois pour les dépôts privés (à la date de juin 2023). Ce programme prend environ 30 secondes à exécuter, ce qui représente un total de 5 minutes par mois.

Lien - [À propos de la facturation de GitHub Actions - GitHub Docs](https://docs.github.com/fr/billing/managing-billing-for-github-actions/about-billing-for-github-actions)

J'ai ajouté des lignes pour mettre en cache les dépendances, mais cela ne permet de gagner que quelques secondes.

Si vous voulez économiser du temps d'exécution, réduisez la date ou le temps d'attente.
