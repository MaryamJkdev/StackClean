#!/usr/bin/env node
// stackclean — Copyright (c) 2026 Skyler (meetskyler). All rights reserved.
// Unauthorized copying or redistribution of this package is strictly prohibited.
// https://www.npmjs.com/package/stackclean

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

const projectPath = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function deleteFile(filePath, label) {
  if (fs.existsSync(filePath)) {
    fs.removeSync(filePath);
    console.log(chalk.green(`  ✓ Deleted:  ${label}`));
  }
}

function cleanFile(filePath, label, content) {
  if (fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(chalk.blue(`  ✓ Cleaned:  ${label}`));
  }
}

function exists(rel) {
  return fs.existsSync(path.join(projectPath, rel));
}

function filePath(rel) {
  return path.join(projectPath, rel);
}

// ─── DETECT FRAMEWORK ────────────────────────────────────────────────────────

function detectFramework() {
  const pkgPath = path.join(projectPath, "package.json");
  if (!fs.existsSync(pkgPath)) return null;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  if (deps["next"]) {
    // App Router or Pages Router?
    if (exists("app") || exists("src/app")) return "next-app";
    return "next-pages";
  }

  if (deps["react"]) {
    // Vite or CRA?
    if (deps["vite"] || deps["@vitejs/plugin-react"] || deps["@vitejs/plugin-react-swc"])
      return "vite-react";
    return "cra";
  }

  return null;
}

// ─── CLEAN TEMPLATES ─────────────────────────────────────────────────────────

const TEMPLATES = {
  appJsx: `export default function App() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}
`,

  pageTsx: `export default function Home() {
  return (
    <main>
      <h1>Hello World</h1>
    </main>
  );
}
`,

  layoutTsx: (hasGlobalCss) => `import type { Metadata } from "next";
${hasGlobalCss ? `import "./globals.css";\n` : ""}
export const metadata: Metadata = {
  title: "App",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,

  layoutJs: (hasGlobalCss) => `${hasGlobalCss ? `import "./globals.css";\n\n` : ""}export const metadata = {
  title: "App",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,

  emptyCSS: "",
};

// ─── FRAMEWORK CLEANERS ──────────────────────────────────────────────────────

function cleanNextApp() {
  console.log(chalk.cyan("\n🧹 Next.js (App Router) project detected\n"));

  // Detect src/ prefix
  const appDir = exists("src/app") ? "src/app" : "app";
  const isTs = exists(`${appDir}/page.tsx`) || exists(`${appDir}/layout.tsx`);

  // Delete all default public assets
  deleteFile(filePath("public/next.svg"), "public/next.svg");
  deleteFile(filePath("public/vercel.svg"), "public/vercel.svg");
  deleteFile(filePath("public/file.svg"), "public/file.svg");
  deleteFile(filePath("public/globe.svg"), "public/globe.svg");
  deleteFile(filePath("public/window.svg"), "public/window.svg");
  deleteFile(filePath("public/favicon.ico"), "public/favicon.ico");
  // App dir default files
  deleteFile(filePath(`${appDir}/favicon.ico`), `${appDir}/favicon.ico`);
  deleteFile(filePath(`${appDir}/icon.svg`), `${appDir}/icon.svg`);
  deleteFile(filePath(`${appDir}/apple-icon.png`), `${appDir}/apple-icon.png`);

  // Clean page
  const pageExt = isTs ? "tsx" : "js";
  cleanFile(filePath(`${appDir}/page.${pageExt}`), `${appDir}/page.${pageExt}`, TEMPLATES.pageTsx);

  // Clean layout
  const layoutPath = filePath(`${appDir}/layout.${pageExt}`);
  const hasGlobalCss = exists(`${appDir}/globals.css`);
  if (fs.existsSync(layoutPath)) {
    const layoutContent = isTs ? TEMPLATES.layoutTsx(hasGlobalCss) : TEMPLATES.layoutJs(hasGlobalCss);
    cleanFile(layoutPath, `${appDir}/layout.${pageExt}`, layoutContent);
  }

  // Clean globals.css
  cleanFile(filePath(`${appDir}/globals.css`), `${appDir}/globals.css`, TEMPLATES.emptyCSS);
}

function cleanNextPages() {
  console.log(chalk.cyan("\n🧹 Next.js (Pages Router) project detected\n"));

  deleteFile(filePath("public/next.svg"), "public/next.svg");
  deleteFile(filePath("public/vercel.svg"), "public/vercel.svg");
  deleteFile(filePath("public/file.svg"), "public/file.svg");
  deleteFile(filePath("public/globe.svg"), "public/globe.svg");
  deleteFile(filePath("public/window.svg"), "public/window.svg");
  deleteFile(filePath("public/favicon.ico"), "public/favicon.ico");

  const pagesDir = exists("src/pages") ? "src/pages" : "pages";
  const isTs = exists(`${pagesDir}/index.tsx`);
  const ext = isTs ? "tsx" : "js";

  cleanFile(filePath(`${pagesDir}/index.${ext}`), `${pagesDir}/index.${ext}`, TEMPLATES.pageTsx);

  // Delete example API route
  deleteFile(filePath(`${pagesDir}/api/hello.js`), `${pagesDir}/api/hello.js`);
  deleteFile(filePath(`${pagesDir}/api/hello.ts`), `${pagesDir}/api/hello.ts`);

  const stylesDir = exists("src/styles") ? "src/styles" : "styles";
  cleanFile(filePath(`${stylesDir}/globals.css`), `${stylesDir}/globals.css`, TEMPLATES.emptyCSS);
  deleteFile(filePath(`${stylesDir}/Home.module.css`), `${stylesDir}/Home.module.css`);
}

function cleanViteReact() {
  console.log(chalk.cyan("\n🧹 Vite + React project detected\n"));

  // Delete all default SVGs and assets
  deleteFile(filePath("src/assets/react.svg"), "src/assets/react.svg");
  deleteFile(filePath("public/vite.svg"), "public/vite.svg");
  deleteFile(filePath("public/react.svg"), "public/react.svg");
  deleteFile(filePath("public/favicon.ico"), "public/favicon.ico");
  deleteFile(filePath("public/favicon.svg"), "public/favicon.svg");

  // Delete all remaining SVGs in src/assets
  const assetsDir = filePath("src/assets");
  if (fs.existsSync(assetsDir)) {
    const allFiles = fs.readdirSync(assetsDir);
    const svgFiles = allFiles.filter(f => f.endsWith(".svg"));
    if (svgFiles.length === allFiles.length && svgFiles.length > 0) {
      svgFiles.forEach(f => deleteFile(path.join(assetsDir, f), `src/assets/${f}`));
    }
  }

  const isTs = exists("src/App.tsx");
  const ext = isTs ? "tsx" : "jsx";
  const mainExt = isTs ? "tsx" : "jsx";

  cleanFile(filePath(`src/App.${ext}`), `src/App.${ext}`, TEMPLATES.appJsx);
  cleanFile(filePath("src/App.css"), "src/App.css", TEMPLATES.emptyCSS);
  cleanFile(filePath("src/index.css"), "src/index.css", TEMPLATES.emptyCSS);

  // Clean main entry — remove CSS import if index.css is now empty
  const mainFile = filePath(`src/main.${mainExt}`);
  if (fs.existsSync(mainFile)) {
    let content = fs.readFileSync(mainFile, "utf-8");
    content = content.replace(/^import\s+['"]\.\/index\.css['"]\s*\n?/m, "");
    fs.writeFileSync(mainFile, content);
    console.log(chalk.blue(`  ✓ Cleaned:  src/main.${mainExt}`));
  }
}

function cleanCRA() {
  console.log(chalk.cyan("\n🧹 Create React App project detected\n"));

  // Delete default assets
  deleteFile(filePath("src/logo.svg"), "src/logo.svg");
  deleteFile(filePath("public/favicon.ico"), "public/favicon.ico");
  deleteFile(filePath("public/logo192.png"), "public/logo192.png");
  deleteFile(filePath("public/logo512.png"), "public/logo512.png");
  deleteFile(filePath("public/manifest.json"), "public/manifest.json");
  deleteFile(filePath("public/robots.txt"), "public/robots.txt");

  // Delete unused test/utility files
  const isTs = exists("src/App.tsx");
  const ext = isTs ? "tsx" : "js";
  deleteFile(filePath(`src/App.test.${ext}`), `src/App.test.${ext}`);
  deleteFile(filePath(`src/reportWebVitals.${ext}`), `src/reportWebVitals.${ext}`);
  deleteFile(filePath(`src/setupTests.${ext}`), `src/setupTests.${ext}`);

  cleanFile(filePath(`src/App.${ext}`), `src/App.${ext}`, TEMPLATES.appJsx);
  cleanFile(filePath("src/App.css"), "src/App.css", TEMPLATES.emptyCSS);
  cleanFile(filePath("src/index.css"), "src/index.css", TEMPLATES.emptyCSS);

  // Clean index entry — remove reportWebVitals
  const indexFile = filePath(`src/index.${ext}`);
  if (fs.existsSync(indexFile)) {
    let content = fs.readFileSync(indexFile, "utf-8");
    content = content.replace(/^import reportWebVitals.*\n?/m, "");
    content = content.replace(/^reportWebVitals.*\n?/m, "");
    content = content.replace(/^\/\/ If you want to.*\n?/m, "");
    content = content.replace(/^\/\/ https:\/\/bit\.ly.*\n?/m, "");
    fs.writeFileSync(indexFile, content);
    console.log(chalk.blue(`  ✓ Cleaned:  src/index.${ext}`));
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

console.log(chalk.bold.white("\n  stackclean v1.4.3"));
console.log(chalk.gray(`  Project: ${projectPath}\n`));

if (!fs.existsSync(path.join(projectPath, "package.json"))) {
  console.log(chalk.red("  ✗ No package.json found. Run stackclean inside a React or Next.js project.\n"));
  process.exit(1);
}

const framework = detectFramework();

switch (framework) {
  case "next-app":
    cleanNextApp();
    break;
  case "next-pages":
    cleanNextPages();
    break;
  case "vite-react":
    cleanViteReact();
    break;
  case "cra":
    cleanCRA();
    break;
  default:
    console.log(chalk.red("  ✗ Could not detect a supported framework (Next.js / React).\n"));
    process.exit(1);
}

console.log(chalk.bold.green("\n  ✨ All done! Project is fresh and ready.\n"));
