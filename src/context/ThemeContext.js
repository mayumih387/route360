import React, { useState, useEffect, createContext } from "react"

const defaultState = {
  isDarkMode: false,
  toggleDark: () => {},
}

const ThemeContext = createContext(defaultState)

const supportsDarkMode = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches === true

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.removeAttribute("data-theme")
      localStorage.setItem("theme", "light")
    }
  }, [isDarkMode])

  const theme = localStorage.getItem("theme")

  useEffect(() => {
    if (theme) {
      if (theme === "dark") {
        setIsDarkMode(true)
      }
    } else if (supportsDarkMode()) {
      setIsDarkMode(true)
    }
  }, [])

  const toggleDark = () => {
    setIsDarkMode((prevDark) => !prevDark)
  }

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext
