# MyReads

A personal book-tracking app built with React. Organise your reading life across three standard shelves and unlimited custom booklists, with a full-screen book search and a themeable glass-morphism UI.

## Features

- **Three standard shelves** — Currently Reading, Want to Read, Read
- **Custom booklists** — create, rename, describe, and delete your own lists
- **Book search** — find books by title, author, or ISBN and assign them to any shelf
- **Move books** — drag any book between standard shelves and custom booklists
- **Themes** — four colour palettes (green, blue, purple, yellow) × light/dark mode
- **Persistent state** — all data lives in `localStorage` so nothing is lost on refresh
- **Animated login screen** — scrolling book-cover background fetched from the API

## Tech Stack

| Layer | Choice |
|---|---|
| UI library | React 18 |
| Routing | React Router v6 |
| State | Context API + `useCallback` |
| Styling | CSS custom properties, glass morphism |
| Storage | `localStorage` |
| Build | Create React App |

## Project Structure

```
src/
├── api/
│   └── BooksAPI.js            # getAll / update / search wrappers
├── components/
│   ├── contexts/
│   │   ├── Auth/              # username session
│   │   ├── Booklist/          # custom booklists CRUD
│   │   └── Settings/          # theme + light/dark mode
│   ├── layouts/
│   │   └── SidebarLayout/     # sidebar nav + CSS variable injection
│   └── ui/
│       ├── BookCard/          # cover card with shelf-changer dropdown
│       ├── CustomShelf/       # collapsible accordion for a booklist
│       ├── Shelf/             # grid of BookCards for a standard shelf
│       └── Modals/
│           ├── index.js       # base Modal (createPortal)
│           ├── BookDetailModal/
│           └── BooklistModal/
├── pages/
│   ├── LoginPage/             # animated cover background + login form
│   ├── homePage/              # main dashboard (shelves + booklists)
│   ├── searchPage/            # full-screen book discovery
│   └── SettingPage/           # theme and mode picker
├── themes/
│   └── index.js               # color palettes and mode values
└── index.css                  # global CSS tokens and keyframes
```

## Getting Started

```bash
cd starter
npm install
npm start
```

The app opens at `http://localhost:3000`. Enter any username to log in — no password required.

## Available Scripts

| Script | Description |
|---|---|
| `npm start` | Start the development server |
| `npm run build` | Build for production |
| `npm test` | Run the test suite |

## Routing

| Path | Page | Access |
|---|---|---|
| `/login` | LoginPage | Public |
| `/` | HomePage | Protected |
| `/settings` | SettingPage | Protected |
| `/search` | SearchPage | Protected |

## Backend API

The app uses the Udacity Books backend. Three methods are available:

### `getAll()`
Returns all books currently on the user's shelves.

### `update(book, shelf)`
Moves a book to the specified shelf (`"currentlyReading"`, `"wantToRead"`, or `"read"`).

### `search(query, maxResults?)`
Returns up to 20 books matching the query. Results are limited to the terms listed in [SEARCH_TERMS.md](SEARCH_TERMS.md).

## Theming

Colours and mode values are defined in `src/themes/index.js` and injected as CSS custom properties on `:root` by `SidebarLayout` whenever the user changes their preference. All components consume `var(--color-*)` tokens so a single context update re-skins the entire UI.
