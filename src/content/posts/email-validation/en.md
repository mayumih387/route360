---
title: Integrate e-mail validation by Abstract API to a form [React]
tags:
  - react
date: 2022-11-05T01:00:00.000Z
lastmod: 2022-11-15T02:27:52.966Z
draft: false
---

As a solution for preventing spam from your comment form or contact form, we can use validating API services that check whether the entered e-mail exists or not.

Because these APIs can check e-mails in real-time, it can hugely reduce spam if you make the submit button active just when the e-mail is validated.

- [demo](https://starlit-lollipop-635291.netlify.app/demo/email-demo)
- [code (GitHub)](https://github.com/mayumih387/demo-nextjs/blob/main/pages/demo/email-demo.js)

*The demo above can check 100 e-mails per month (free tier). If it doesn't work, it can exceed the limit.

React Hook to use: `useState()` and `useRef()`

Working environment:

- Node.js v18.12.1
- React v18.2.0

## Sign up for the API

https://www.abstractapi.com/

This time, we're going to use [Abstract API](https://www.abstractapi.com/api/email-verification-validation-api).

Their free tier includes 100 validation per month. It would be enough for a personal blog.

## Make a form Component

I'd add a validation function inside a form component just for the explanation. It's better if the validation function is separated as another component.

### The form

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

### Get the e-mail input value

With `useRef()`, get the value inputted on the form.

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

You can get the value with `emailRef.current.value`.

### A constant to judge whether the value is e-mail format

To avoid unnecessary validations, prepare a constant of the e-mail format and make the function work only when the input value meets it.

```js
const pattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/
```

### Make the function work when the focus is blurred

#### Add a state

With `useState()`, add a constant of;

- `emailIsValid`: whether the input value (= e-mail) is valid or not (default `false`)

Only when the entered e-mail is valid, make the state `true`. *we'll do it later.

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

#### Add a handler

Now let's add a handler to judge the entered e-mail when the focus is blurred from the `input` tag. It's an `onBlur` event to use.

Plus, let the handler work only when the entered value meets the constant `pattern` so that some unnecessary validations won't run.

By `emailRef` set with a React Hook `useRef()`, you can get the current value as `emailRef.current.value`. So, check whether the value meets the constant `pattern` using the `test()` method of javascript.

```js
pattern.test(emailRef.current.value)
```

<span class="label warning">Reference</span> [RegExp.prototype.test() - JavaScript - MDN Web Docs - Mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test)

The handler name below is up to you. `async` is added because of the asynchronous communication with the API.

<div class="filename">/components/form.js</div>

```js
import { useRef, useState } from "react"
const pattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/

const Form = () => {
  //...

  const emailCheckHandler = async () => {
    if (pattern.test(emailRef)) {
      // validation challenge here

      if () { // when passed
        setEmailIsValid(true)
      } else { // when failed
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

#### Validation challenge with Abstract API

Now use `fetch()` to connect to Abstract API.

With Abstract API, the result of the validation is returned on the following URL;

```html
https://emailvalidation.abstractapi.com/v1/?api_key=[API_KEY]&email=[EMAIL_TO_VALIDATE]
```

The steps to get the response:

```js
const url = "https://emailvalidation.abstractapi.com/v1/?api_key=[API_KEY]&email=[EMAIL_TO_VALIDATE]"
const response = await fetch(url)
const data = await response.json()
```

The response itself can be visible with `console.log(data)`;

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

The e-mail validation by Abstract API is given by `quality_score` between 0.01 and 0.99.

As I put the response in the constant `data` above, the score can be retrieved with `data.quality_score`.

In my environment, it returns 0.7 for a Gmail address. Just try it with some e-mail addresses and find your point where the challenge can pass.

The check handler would be like the following. Do not expose your API key but keep it inside `.env`.

<div class="filename">/components/form.js</div>

```js
  const emailCheckHandler = async () => {
    if (pattern.test(emailRef.current.value)) {
      const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&email=${emailRef.current.value}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.quality_score >= 0.7) {// OK
        setEmailIsValid(true)
      } else {// Failed
        setEmailIsValid(false)
      }
    }
  }
```

Because the API key must work on the client side, you'll need to add a prefix in the case of Next.js or Gatsby.js.;

<div class="filename">.env</div>

```bash
# Next.js
NEXT_PUBLIC_ABSTRACT_API=xxxxxxxxxxxxxxxxx

# Gatsby.js
GATSBY_ABSTRACT_API=xxxxxxxxxxxxxxxxx
```
## The code

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

## Make the form more practical

The form would be more secure with reCaptcha, etc.

- Integration of reCaptcha or hCaptcha (security)
- Activate the submit button after e-mail validation and reCaptcha challenge (security)
- Show a spinner during the e-mail validation (UX)

There are some other points to take care of about the Form. [Abstract official guidance](https://www.abstractapi.com/guides/react-form-validation#react-hook-form-validation) would be helpful for it.

That's it!