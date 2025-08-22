# Styling

Global styles live in `app/globals.css` and Tailwind CSS v4 is used via `@import "tailwindcss"`.

## CSS Variables

The project defines base color variables and registers theme tokens mapped to Tailwind tokens.

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

## Fonts

Fonts are loaded via `next/font/google` in `app/layout.tsx` and exposed as CSS variables `--font-geist-sans` and `--font-geist-mono` used in the theme mapping above.