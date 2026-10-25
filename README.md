# vs

Go-Orbit-Programmers-Pro is LOCK33 Development Organization's vscode action tool for [lock33.dev](https://lock33.dev).

`vs` is a browser code editor. Open it, edit files, and run actions from the command menu. The editing surface is [Monaco Editor](https://microsoft.github.io/monaco-editor/) (the editor component VS Code uses), so syntax highlighting, find, and multi-cursor editing are available in the page. Files stay in this browser until you download them. The app is a static site: no account, no server, and no secrets.

## Features

- Light and dark themes. On a wide screen the sun/moon control is at the bottom of the left bar. On a phone it sits at the top right.
- Command menu entries **Use light theme** and **Use dark theme** (Ctrl+Shift+P or F1).
- The theme choice is stored in `localStorage` under `vs.theme` and the editor surface follows it.
- File tree with new file, new folder, rename, delete, and download. The workspace is stored in this browser.
- Starter files include `go.os` (Go, including the `os` package) and `src/hello.ts`.
- Layout that works on a phone: the file list opens over the editor, and the theme control moves to the top right.

## Requirements

- Node.js 22 or newer
- npm

## Run locally

```bash
npm ci
npm run dev
```

Vite prints a local URL (default `http://127.0.0.1:5173`). Open it in a browser.

## Test

```bash
npm test
```

## Build

```bash
npm run build
npm run preview
```

`npm run build` typechecks and writes a static site to `dist/`. `npm run preview` serves that folder.

## Deploy

Copy the contents of `dist/` to any static host. Asset paths are relative, so the site can live at a domain root or a subpath.

1. Build with `npm run build`.
2. Upload `dist/` to the host (object storage, a static web server, or GitHub Pages).
3. Serve `index.html` for the app URL. No environment variables and no API keys are required.
4. Point DNS for the public name (such as `lock33.dev`) at that host and turn on HTTPS there.

The repository does not configure hosting or DNS. Publishing to `lock33.dev` is a step for the LOCK33 organization after this app is built.

## Keyboard

| Action | Shortcut |
| --- | --- |
| Command menu | Ctrl+Shift+P or F1 |
| Quick open / command menu | Ctrl+P |
| Toggle the file list | Ctrl+B |
| Save into this browser | Ctrl+S |
| Find in the file | Ctrl+F |

On macOS, Command is the modifier in place of Ctrl.

## Theme

- Wide screens: sun/moon button at the bottom of the left activity bar.
- Phones (narrow screens): the same button at the top right of the header. The left bar is hidden so the editor can use the width.
- Command menu: **Use light theme**, **Use dark theme**.
- Storage key: `vs.theme` (`light` or `dark`). A first visit with no stored choice follows the operating system, and stays on the choice you make after that.

## What this package is

This is the browser tool for lock33.dev. It is a focused editor and command menu, built to be cloned, built, and hosted. It keeps the MIT license in `LICENSE`.

Third-party editor code: Monaco Editor, MIT licensed, installed from npm. It is not vendored into this repository.

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) installs dependencies, runs `npm test`, and runs `npm run build` on Ubuntu with Node.js 22.

## License

MIT. Copyright (c) 2026 Jason Adam Hoffman. See `LICENSE`.
