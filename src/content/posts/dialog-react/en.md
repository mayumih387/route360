---
title: How to create a modal window with dialog element in React
tags:
  - react
date: 2023-06-20
lastmod: 2023-06-20
draft: false
---

As everyone knows, the latest HTML and CSS allow us to realize javascript-like expressions.

Today I'd like to show you how to make an HTML `<dialog>` element work as a modal window in React.

In React, we generally have to use `useState` to show and hide a modal window.

If you replace it with `<dialog>`, you don't need `useState` for this and can reduce a state. No modal window is needed then.

Environment

- React v18.2.0

## The Code

```js
import React, { useRef } from "React"

const Dialog = () => {
  const dialog = useRef()

  const openHandler = () => {
    dialog.current.showModal()
  }

  const closeHandler = () => {
    dialog.current.close()
  }

  return (
    <>
      <dialog ref={dialog}>
        <p>This is a dialog</p>
        <button onClick={closeHandler} type="button">
          Close
        </button>
      </dialog>
      <button type="button" onClick={openHandler}>
        Show a dialog
      </button>
    </>
  )
}

export default Dialog
```

## Keys

- Control the dialog element with `useRef()`
- Style the background CSS with `::backdrop`

In the code above, I added a handler to a button element. It is also possible to display the dialog with `onSubmit` of a form element, so we can display the message `Your message has been sent.

### An example to show a dialog after submitting a form

```js
import React, { useRef } from "React"

const Form = () => {
  const dialog = useRef()

  const submitHandler = (event) => {
    event.preventDefault()
    // ...
    // fetch or functions to send items...
    // ...
    dialog.current.showModal()
  }

  const closeHandler = () => {
    dialog.current.close()
  }

  return (
    <>
      <dialog ref={dialog}>
        <p>Your message was sent successfully.</p>
        <button onClick={closeHandler} type="button">
          Close
        </button>
      </dialog>
      <form onSubmit={submitHandler}>
        <input type="text">
        <button type="submit" onClick={submitHandler}>
          Submit
        </button>
      </form>
    </>
  )
}

export default Form
```

Normally we use a lot of `useState` for a form component, but in the code above I omitted them for an example of a dialog.

With this kind of dialog, we don't need to prepare a thank you page after submission.

If you want to use the dialog as a custom component, use `forwardRef` to control `ref`.

## Disadvantages of dialog elements

After switching some of my modal components to dialog elements, I feel that dialog elements have disadvantages; all elements are included to the first DOM tree despite the show/hide Rreact function.

A modal component controlled by React state won't be included the first time the page is loaded. However, a dialog element is already included and loaded even at the first load, it can matter to the page speed.

So dialog elements should only be used for a small alert or small message, I guess.
