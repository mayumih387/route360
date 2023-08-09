---
title: How to make a tooltip component in React
tags:
  - react
date: 2023-08-09
lastmod: 2023-08-09
draft: false
---

This post is about how to make your own Tooltip component in React.

Though you might feel easier with using UI Components or other libraries, I just prefer making those things by myself to installing anythings.

- [Demo](https://starlit-lollipop-635291.netlify.app/demo/tooltip-demo)
- [Code (GitHub)](https://github.com/mayumih387/demo-nextjs/blob/main/pages/demo/tooltip-demo.js)

We use `useState()` as a React hook this time.

## The Final Code

\*For CSS (Tooltip.module.css), see the second half of this article.

<div class="filename">/component/Tooltip.js</div>

```js
import { useState } from "react"
import styles from "../components/Tooltip.module.css"

const Tooltip = props => {
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false)

  const tooltipHandler = () => {
    setTooltipIsOpen(prevState => !prevState)
  }
  const closeTooltipHandler = () => {
    setTooltipIsOpen(false)
  }

  return (
    <>
      <button
        className={styles.tooltipButton}
        onClick={tooltipHandler}
        onBlur={closeTooltipHandler}
        type="button"
      >
        {props.buttonName}
      </button>
      {/* tooltip itself */}
      {tooltipIsOpen && <div className={styles.tooltip}>{props.children}</div>}
    </>
  )
}

export default Tooltip
```

<div class="filename">/pages/demo/tooltip-demo.js</div>

```js
import Tooltip from "../../components/Tooltip"

const TooltipDemo = () => {
  return <Tooltip buttonName="I am a button!">I am inside Tooltip!</Tooltip>
}

export default TooltipDemo
```

Explanations follow.

## Create a button element - click to show a tooltip

First, create Tooltip.js under your component directory.

<div class="filename">/component/Tooltip.js</div>

```js
const Tooltip = props => {
  return (
    <>
      <button type="button">{props.buttonName}</button>
      {/* tooltip itself */}
      <div>{props.children}</div>
    </>
  )
}

export default Tooltip
```

We need to use `<button>` here which is clickable.

(Note) Because `<div>` or other some elements are not clickable, it's not recommended from the point of view of web accessibility. Just use `<button>` as you can modify its appearance with CSS as much as you want.

To generalize this Tooltip, let this component receive button text and tooltip content with `props`.

In this example, it receives `buttonName` as button text, and `children` as tooltip content.

## Show the button in frontend

Because this [demo](https://starlit-lollipop-635291.netlify.app/demo/tooltip-demo) is built on Next.js, I put the page under `/pages/demo/` directory.

If you are using Gatsby.js or other architecture, please justify those folder names.

<div class="filename">/pages/demo/tooltip-demo.js</div>

```js
import Tooltip from "../../components/Tooltip"

const TooltipDemo = () => {
  return <Tooltip buttonName="I am a button!">I am inside Tooltip!</Tooltip>
}

export default TooltipDemo
```

To pass the data to Tooltip component, this `<Tooltip>` has `buttonName` property as button text and `I am inside Tooltip!` as tooltip content.

Then, Tooltip component can receive those data through `props`.

Until now, both (button and tooltip content) are still shown in frontend at the same time.

## Add tooltip state on Tooltip Component

Now add "show/hide" state of tooltip content on Tooltip Component. It's time to use `useState()`.

Default `tooltipIsOpen` state is `false`. Make the tooltip content shown "only when the state turns `true`".

<div class="filename">/component/Tooltip.js</div>

```js
import { useState } from "react"

const Tooltip = props => {
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false)

  return (
    <>
      <button type="button">{props.buttonName}</button>
      {/* tooltip itself */}
      {tooltipIsOpen && <div>{props.children}</div>}
    </>
  )
}

export default Tooltip
```

If you are using Gatsby.js, "`'React' must be in scope when using JSX`" error can be out. In that case, change the first line above like below and import React itself.

```js
import React, { useState } from "react"
```

Try to switch default `useState` to `true` or `false`. You'll see the tooltip content is shown/hide in frontend.

## Make a handler on the button to display/hide the tooltip content

Now, make a handler to display/hide the tooltip content when the button is clicked.

<div class="filename">/component/Tooltip.js</div>

```js
import { useState } from "react"

const Tooltip = props => {
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false)

  const tooltipHandler = () => {
    setTooltipIsOpen(prevState => !prevState)
  }

  return (
    <>
      <button type="button" onClick={tooltipHandler}>
        {props.buttonName}
      </button>
      {/* tooltip itself */}
      {tooltipIsOpen && <div>{props.children}</div>}
    </>
  )
}

export default Tooltip
```

With `onClick` attribute on the button element, `tooltipHandler` runs when it's clicked.

Its `tooltipHandler` works as

- when `tooltipIsOpen` is `false`, it switches the state to `true`
- when `tooltipIsOpen` is `true`, it switches the state to `false`

So, it's like a toggle.

Try to click the button several times. You'll see the tooltip content shows/hides.

## Make an another handler on the button to hide the tooltip content with a click somewhere on display

You might think it's more useful if tooltip content hides when somewhere on the display is clicked. It's easy.

You just add `onBlur` attribute and handler on the button element. Then, when the focus is out, make the tooltip content not displayed (= make `tooltipIsOpen` state `false`).

<div class="filename">/component/Tooltip.js</div>

```js
import { useState } from "react"

const Tooltip = props => {
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false)

  const tooltipHandler = () => {
    setTooltipIsOpen(prevState => !prevState)
  }

  const closeTooltipHandler = () => {
    setTooltipIsOpen(false)
  }

  return (
    <>
      <button
        onClick={tooltipHandler}
        onBlur={closeTooltipHandler}
        type="button"
      >
        {props.buttonName}
      </button>
      {/* tooltip itself */}
      {tooltipIsOpen && <div>{props.children}</div>}
    </>
  )
}

export default Tooltip
```

Just one line of `setTooltipIsOpen(false)`, that's it!

## Create a css module

This time, I use CSS module for styling. I put the file in the component directory (same as Tooltip.js), but it's up to you. You might be able to use styles directory as well.

The styling below is just an example.

<div class="filename">/component/Tooltip.module.css</div>

```css
.tooltipButton {
  position: relative;
}

.tooltip {
  position: absolute;
  top: 2em;
  left: 1em;
  background: #fff;
  margin-top: 0.75rem;
  padding: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
  z-index: 10;
  color: #000;
}

.tooltip::before {
  content: "";
  position: absolute;
  top: -30px;
  left: 50%;
  margin-left: -15px;
  border: 15px solid transparent;
  border-bottom: 15px solid #fff;
}
```

Then, import the CSS module on Tooltip.js.

<div class="filename">/component/Tooltip.js</div>

```js
import styles from "../components/Tooltip.module.css"

const Tooltip = props => {
  //...
}
```

Done!

Tooltip component is not that difficult, even it's very simple. It's good for practice and to know how much you understand React.js.
