# MyReads

A personal book-tracking app built with React. Organise your reading life across three shelves, search for new books, and customise the UI with multiple themes and light/dark mode.

## Features

- **Three shelves** — Currently Reading, Want to Read, Read
- **Book search** — find books by title or author and add them to any shelf
- **Move books** — move books between shelves or remove them
- **Themes** — four colour palettes (green, blue, purple, yellow) × light/dark mode
- **Animated login screen** — scrolling book-cover background fetched from the API

## Tech Stack

| Layer | Choice |
|---|---|
| UI library | React 17 |
| Routing | React Router v6 |
| State | Context API + `useCallback` |
| Styling | CSS custom properties, glass morphism |
| Build | Create React App |

## Project Structure

```
starter/src/
├── api/
│   └── BooksAPI.js            # getAll / update / search wrappers
├── components/
│   ├── contexts/
│   │   ├── Auth/              # username session
│   │   └── Settings/          # theme + light/dark mode
│   ├── layouts/
│   │   └── SidebarLayout/     # sidebar nav + CSS variable injection
│   └── ui/
│       ├── BookCard/          # cover card with shelf-changer dropdown
│       ├── Shelf/             # horizontal row of BookCards for a shelf
│       └── Modals/
│           ├── index.js       # base Modal (createPortal)
│           └── BookDetailModal/
├── pages/
│   ├── LoginPage/             # animated cover background + login form
│   ├── HomePage/              # main dashboard with three shelves
│   ├── SearchPage/            # full-screen book search
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

The app uses the Udacity Books backend via `starter/src/api/BooksAPI.js`. All shelf operations go through the API:

| Method | Description |
|---|---|
| `getAll()` | Returns all books on the user's shelves |
| `update(book, shelf)` | Moves a book to a shelf (`"currentlyReading"`, `"wantToRead"`, `"read"`, or `"none"`) |
| `search(query, maxResults?)` | Returns up to 20 books matching the query (limited to terms in [SEARCH_TERMS.md](starter/SEARCH_TERMS.md)) |

## Theming

Colours and mode values are defined in `starter/src/themes/index.js` and injected as CSS custom properties on `:root` by `SidebarLayout` whenever the user changes their preference. All components consume `var(--color-*)` tokens so a single context update re-skins the entire UI.
