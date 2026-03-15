# MyReads Project

A bookshelf app built with React that allows users to categorize books into three shelves: **Currently Reading**, **Want to Read**, and **Read**. Users can search for new books and add them to their shelves. Built as the final assessment project for Udacity's React Fundamentals course.

## Getting Started

```bash
npm install
npm start
```

The app will run at [http://localhost:3000](http://localhost:3000).

## Features

- View books organized into three shelves
- Move books between shelves using a dropdown selector
- Search for new books and add them to a shelf
- Remove books from all shelves
- User authentication (username-based login)
- Customizable color theme and light/dark mode

## Project Structure

```
src/
├── api/
│   └── BooksAPI.js            # Udacity backend API (getAll, update, search)
├── components/
│   ├── contexts/
│   │   ├── Auth/              # Authentication context (login/logout)
│   │   └── Settings/          # Theme & mode context
│   ├── layouts/
│   │   └── SidebarLayout/     # Main layout with sidebar navigation
│   └── ui/
│       ├── BookCard/          # Single book display with shelf-changer menu
│       ├── Modals/            # Base Modal + BookDetailModal
│       └── Shelf/             # Shelf component rendering a row of BookCards
├── pages/
│   ├── HomePage/              # Main page — three shelves via BooksAPI.getAll()
│   ├── LoginPage/             # Login screen with animated book cover background
│   ├── SearchPage/            # Search page via BooksAPI.search()
│   └── SettingPage/           # Theme color and light/dark mode settings
├── themes/
│   └── index.js               # Color themes and light/dark mode definitions
├── App.js                     # Root component with routing and context providers
└── index.js                   # Entry point
```

## Backend API

The app uses the Udacity Books API via [`src/api/BooksAPI.js`](src/api/BooksAPI.js):

| Method | Description |
|--------|-------------|
| `getAll()` | Returns all books currently on the user's shelves |
| `update(book, shelf)` | Moves a book to a shelf (`"currentlyReading"`, `"wantToRead"`, `"read"`, or `"none"`) |
| `search(query, maxResults)` | Searches the catalogue (max 20 results) |

**Note:** The search API only supports a fixed set of terms listed in [SEARCH_TERMS.md](SEARCH_TERMS.md).

## Built With

- [React](https://reactjs.org/) 17
- [React Router](https://reactrouter.com/) v6
- [Create React App](https://create-react-app.dev/)
