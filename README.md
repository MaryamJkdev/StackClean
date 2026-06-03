# stackclean

> Instantly remove default boilerplate from React and Next.js projects.

Every new project starts with files you never use. `stackclean` deletes them in one command.

## Usage

Run inside your project folder:

```bash
npx stackclean
```

Or pass a path:

```bash
npx stackclean ./my-project
```

## What it cleans

| Framework | Deleted | Emptied |
|-----------|---------|---------|
| Next.js (App Router) | `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`, `favicon.ico`, `icon.svg`, `apple-icon.png` | `page.tsx`, `layout.tsx`, `globals.css` |
| Next.js (Pages Router) | `next.svg`, `vercel.svg`, `favicon.ico`, `Home.module.css`, `api/hello.js` | `index.tsx`, `globals.css` |
| Vite + React | `react.svg`, `vite.svg`, `favicon.ico`, all `src/assets` SVGs | `App.jsx`, `App.css`, `index.css`, `main.jsx` |
| Create React App | `logo.svg`, `favicon.ico`, `logo192.png`, `logo512.png`, `manifest.json`, `robots.txt`, `reportWebVitals.js`, `App.test.js` | `App.js`, `App.css`, `index.css`, `index.js` |

## Supports

- JavaScript and TypeScript
- `src/` folder structure
- App Router and Pages Router (Next.js)

## License

ISC
