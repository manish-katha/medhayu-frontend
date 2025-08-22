
"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Contrast } from "lucide-react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
       <div className="relative flex h-11 items-center justify-center rounded-full border bg-muted p-1">
          <div className="h-8 w-8 animate-pulse rounded-full bg-border" />
      </div>
    );
  }
  
  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "grayscale", label: "Grayscale", icon: Contrast },
    { value: "dark", label: "Dark", icon: Moon },
  ]
  

  return (
    <div className="theme-control">
      <div className="indicator"></div>
      
      {themes.map(t => (
          <React.Fragment key={t.value}>
            <input 
              type="radio" 
              name="theme" 
              id={t.value} 
              className="sr-only" 
              value={t.value} 
              checked={theme === t.value} 
              onChange={(e) => setTheme(e.target.value)} 
            />
            <label htmlFor={t.value} title={`${t.label} Mode`}>
              <t.icon className="h-4 w-4" />
            </label>
          </React.Fragment>
      ))}
    </div>
  )
}
