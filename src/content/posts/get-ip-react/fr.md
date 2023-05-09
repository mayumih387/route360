---
title: Comment obtenir l'adresse IP du client dans React sans Axios
tags:
  - react
date: 2022-11-24T02:00:00.185Z
lastmod: 2023-03-02T07:22:33.394Z
draft: false
---

C'est la méthode que j'ai utilisée pour obtenir une adresse IP pour le système de commentaires ou le formulaire de demande.

Comme Javascript lui-même ne peut pas saisir l'adresse IP du client, nous allons utiliser une API tierce.

Les Hooks React à utiliser pour cet exemple sont `useState()` et `useEffect()`.

- [Demo](https://starlit-lollipop-635291.netlify.app/demo/getip-demo)
- [Code (GitHub)](https://github.com/mayumih387/demo-nextjs/blob/main/pages/demo/getip-demo.js)

Bien que la démo ci-dessus soit construite dans Next.js, elle doit fonctionner dans React sans framework.

## L'API

https://ipapi.co/

- Aucun compte n'est requis
- Aucun jeton API
- Aucun blocage par Adblock (au moment de la rédaction, octobre 2022)

J'ai également essayé [ipinfo.io](https://ipinfo.io/), mais il ne fonctionnait pas bien lorsque Adblock était activé. Mais comme il faut un compte (qui fournit un jeton API), il offre des fonctions variées. Ce qui est gênant, c'est qu'il faut envoyer un email quand on veut fermer le compte.

Il existe d'autres API qui fournissent les adresses IP des clients. Je suppose que le code que je vais introduire doit être presque le même, juste quelques petits changements d'objets.

Je recommand l'IP Geolocation API par [Abstract API](https://www.abstractapi.com/). On peut utiliser 20 000 raquet

I personally recommend the IP Geolocation API from [Abstract API](https://www.abstractapi.com/). On peut obtenir gratuitement 20 000 demandes par mois. Adblock ne l'empêche pas, et en plus il renvoie toujours l'IPv4 (je pense, d'après mes cas). L'inscription est obligatoire.

### ipapi.co renvoie parfois le format IPv6 (modifié le 12 janv. 2023)

ipapi.co renvoie parfois le format IPv6 selon l'endroit d'où l'utilisateur accède.

ex. 240d:1a:b21:8500:9809:92e9:d811:7033A

Si vous n'avez besoin que du format IPv4, vous devriez envisager le plan payant ou un autre client API.

## Le code

```js
import { useState, useEffect } from 'react'

export default function GetIP() {
  // Préparer une constante `ip` avec des données vides par défaut
  const [ip, setIp] = useState()

  const getIp = async () => {
    // Connecter ipapi.co avec fetch()
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    // Définir l'adresse IP avec la constante `ip`.
    setIp(data.ip)
  }

  // Exécutez la fonction `getIP` ci-dessus une seule fois lorsque la page est rendue.
  useEffect(() => {
    getIp()
  }, [])

  return (
    <p>Votre adresse IP est {ip}.</p>
  )
}
```

1. Préparer une constante `ip` avec des données vides par défaut
2. Dans la fonction `getIP`, connecter [ipapi.co](https://ipapi.co/) avec fetch(). Mettre l'adresse IP dans la constante `ip`.
3. Avec `useEffect()`, exécuter la fonction `getIP` pour la première fois du rendu

Comme les données ont été récupérées avec `const data = await response.json()`, vous pouvez vérifier le résultat de l'objet avec `console.log(data)` si vous le souhaitez ;

```js
{
  "ip": "185.94.188.134",
  "network": "185.94.188.0/24",
  "version": "IPv4",
  "city": "Amsterdam",
  "region": "North Holland",
  "region_code": "NH",
  "country": "NL",
  "country_name": "Netherlands",
  "country_code": "NL",
  "country_code_iso3": "NLD",
  "country_capital": "Amsterdam",
  "country_tld": ".nl",
  "continent_code": "EU",
  "in_eu": true,
  "postal": "1012",
  "latitude": 52.3716,
  "longitude": 4.8883,
  "timezone": "Europe/Amsterdam",
  "utc_offset": "+0200",
  "country_calling_code": "+31",
  "currency": "EUR",
  "currency_name": "Euro",
  "languages": "nl-NL,fy-NL",
  "country_area": 41526,
  "country_population": 17231017,
  "asn": "AS9009",
  "org": "M247 Ltd"
}
```

obtenir le pays, la latitude ou la longitude, etc. Les données récupérées peuvent être utilisées pour de nombreuses occasions.

Le code que j'ai introduit est la base de React Hooks, ce qui serait une bonne pratique. Cependant, ceux qui visitent ce site (route360.dev) feront un simple copier-coller, je suppose😂