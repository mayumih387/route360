---
title: How to return random strings when copying text to prevent content theft in React
tags:
  - react
date: 2024-03-26
lastmod: 2024-03-26
draft: false
---

This entry introduces a way to prevent stolen content for websites using the React framework such as NextJS and Gatsby.

When the content is copied, the code returns random strings instead of the text itself.

Environment

- React v18.2.0

## The code to prevent textcopy in React

Add the following code inside one of the top-level components.

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

## How it works

When the content is copied, `handleCopy` runs.

The random strings are generated inside `for`; a character is selected from `chars` and added 10 times to the random string variable `copiedText`.

Then `navigator.clipboard.writeText()` returns the random strings of 10 characters to the user's clipboard.

In this entry, I set the length of the random strings to 10, but it's possible to make it the same as the length of the copied text with `event`. In this case it might be better to set the maximum length of the random strings.

Also, though the code above works for whole elements under `<body>`, you may use it only for main content element.

Unfortunately, it can't prevent scrapying bots. It's just against human copy & paste.

That's it.