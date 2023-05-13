---
title: How to get the client IP address in React without Axios
tags:
  - react
date: 2022-11-24T02:00:00.185Z
lastmod: 2023-03-02T07:20:23.788Z
draft: false
---

This is the method I used to get an IP address for a comment system or an inquiry form.

Because JavaScript itself can't catch the client IP address, here we're using a third-party API.

The React Hooks to use for this example are `useState()` and `useEffect()`.

- [Demo](https://starlit-lollipop-635291.netlify.app/demo/getip-demo)
- [Code (GitHub)](https://github.com/mayumih387/demo-nextjs/blob/main/pages/demo/getip-demo.js)

Though the demo above is built in Next.js, it must work in React without a framework.

## The API

https://ipapi.co/

- No account is required
- No API token
- No block by Adblock (at the moment of writing, Nov 2022)

I also tried [ipinfo.io](https://ipinfo.io/), but it didn't work well when Adblock was set. But as it requires an account (which provides an API token), it offers some varied functions. What is cumbersome is that you'll need to send an email when you want to close the account.

There are some other APIs that provide client IP addresses. I guess the code I'm going to introduce must be almost the same, just some small changes in objects.

I personally recommend the IP Geolocation API from [Abstract API](https://www.abstractapi.com/). You can get 20,000 requests per month for free. Adblock doesn't prevent it, and also it returns IPv4 all the time (I think, according to my cases). Registration is required.

### ipapi.co sometimes returns IPv6 (updated on Jan 12, 2023)

ipapi.co sometimes returns IPv6 format depending on where the user accesses from.

ex. 240d:1a:b21:8500:9809:92e9:d811:7033A

If you need only an IPv4 format, you should consider the paid plan or another API client.

## The code

```js
import { useState, useEffect } from "react"

export default function GetIP() {
  // Prepare a constant `ip` with empty data by default
  const [ip, setIp] = useState()

  const getIp = async () => {
    // Connect ipapi.co with fetch()
    const response = await fetch("https://ipapi.co/json/")
    const data = await response.json()
    // Set the IP address to the constant `ip`
    setIp(data.ip)
  }

  // Run `getIP` function above just once when the page is rendered
  useEffect(() => {
    getIp()
  }, [])

  return <p>Your IP address is {ip}.</p>
}
```

1. Prepare a constant `ip` with empty data by default
2. Inside the function, `getIP`, connect [ipapi.co](https://ipapi.co/) with fetch(). Set the IP address into the const `ip`.
3. With `useEffect()`, run the function `getIP` for the first time of rendering

As the data was retrieved with `const data = await response.json()`, you can check the result of the object with `console.log(data)` if you want;

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

Not only the IP address, but you can also get the country, latitude or longitude, etc. The fetched data can be utilized for many occasions.

The code I've introduced is the basics of React Hooks, which would be a good practice. However, those who visit here will just copy & paste, I guess😂
