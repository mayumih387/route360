---
title: Block Form Submission by email, words and IPs in React
tags:
  - react
date: 2023-09-15
lastmod: 2023-09-15
---

This post is about how to prevent form submission by email, words and IPs in React.

Personally, I use [getForm](https://getform.io/) and [formspree](https://formspree.io/) as form backends, but they don't offer blocking feature like rich backends (except for spam submissions).

Therefore, I create a blacklist file on local, then keep the submit button `disabled` when any email or banned words are included in the input/textarea element.

Environment:

- React 18.2.0

## Files

```tree
src/
├─ components/
│    └─ Form.js
├─ lib/
│    └─ blackList.js
```

## Blocking by email

Here is the simplified code to block email submissions.

### The code

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
        Submit
      </button>
    </form>
  )
}
```

<div class="filename">src/lib/blackList.js</div>

```js
export const blackEmails = ["aaa@example.com", "@test.com"]
```

### Explanation

1. Import the blacklist into the Form component
2. Check if the entered email is in the blacklist
3. Only if the given email is not in the blacklist, set `enableSubmit` to `true`.

To check if the entered email is included in the blacklist, I used `includes()` of JavaScript.

Link - [Array.prototype.includes() - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)

## Blocking by words

Now let's add a prevention by words inside the `<textarea>`.

### The code

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
        Submit
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

## Blocking by IP

By using [the way to get the client's IP address in React](../get-ip-react/), we can add IP blocks.

To get the client's IP, connect to the IP check API on the first render. To do this, import `useEffect` from React.

### The code

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
    // Connect to ipapi.co
    const response = await fetch("https://ipapi.co/json/")
    const data = await response.json()
    // Set the ip to `ip`
    setIp(data.ip)
  }

  // Run `getIP` on the first rendering
  useEffect(() => {
    getIp()
  }, [])

  return (
    <form>
      <label htmlFor="email">Email</label>
      <input type="email" id="email" onChange={emailChangeHandler} />
      <button type="submit" disabled={!enableSubmit}>
        Submit
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

Of course, you can connect to other APIs instead of ipapi.co that don't require registration. Just pay attention to the response elements, as they may be different in the other APIs.

Also, in practical cases, it would be better to get IP when the reCaptcha is passed or other timings, since the usage will be consumed if you get IP everytime of the first renders.

That's it.
