import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as BooksAPI from "../../api/BooksAPI";
import { useBooklist } from "../../components/contexts/Booklist";
import "./index.css";

function SearchPage() {
  const navigate = useNavigate();
  const { booklists, addBookToList, removeBookFromList } = useBooklist();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [shelvedBooks, setShelvedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [addedBookId, setAddedBookId] = useState(null);
  const menuRef = useRef(null);

  // Fetch the user's shelved books so we can show which shelf each result is on.
  useEffect(() => {
    BooksAPI.getAll().then((books) => {
      if (Array.isArray(books)) {
        setShelvedBooks(books);
      }
    });
  }, []);

  // Debounced search — waits 500ms after the user stops typing.
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      BooksAPI.search(query.trim(), 20)
        .then((books) => {
          if (cancelled) return;
          setResults(Array.isArray(books) ? books : []);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Close the dropdown when the user clicks anywhere outside it.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  // O(1) shelf lookup by book id.
  const shelfMap = useMemo(() => {
    const map = new Map();
    shelvedBooks.forEach((b) => map.set(b.id, b.shelf));
    return map;
  }, [shelvedBooks]);

  const getBookCurrentShelf = useCallback((book) => {
    const shelf = shelfMap.get(book.id);
    if (shelf) return shelf;
    for (const list of booklists) {
      if (list.books.some((b) => b.title === book.title)) return `custom-${list.id}`;
    }
    return null;
  }, [shelfMap, booklists]);

  /** Adds a book to the chosen shelf using BooksAPI.update(). */
  const addToShelf = useCallback((book, shelfKey) => {
    const currentShelf = getBookCurrentShelf(book);

    // Remove from current custom list if applicable.
    if (currentShelf && currentShelf.startsWith("custom-")) {
      removeBookFromList(currentShelf.replace("custom-", ""), book.title);
    }

    if (shelfKey === "none") {
      // Remove from standard shelf via API.
      BooksAPI.update(book, "none").then(() => {
        setShelvedBooks((prev) => prev.filter((b) => b.id !== book.id));
      });
    } else if (shelfKey.startsWith("custom-")) {
      // Move to custom booklist (localStorage only).
      if (currentShelf && !currentShelf.startsWith("custom-")) {
        BooksAPI.update(book, "none").then(() => {
          setShelvedBooks((prev) => prev.filter((b) => b.id !== book.id));
        });
      }
      const bookData = {
        title: book.title,
        authors: book.authors ? book.authors.join(", ") : "Unknown",
        coverUrl: book.imageLinks ? book.imageLinks.thumbnail : "",
        width: 90,
        height: 135,
      };
      addBookToList(shelfKey.replace("custom-", ""), bookData);
    } else {
      // Move to standard shelf via API.
      BooksAPI.update(book, shelfKey).then(() => {
        setShelvedBooks((prev) => {
          const filtered = prev.filter((b) => b.id !== book.id);
          return [...filtered, { ...book, shelf: shelfKey }];
        });
      });
    }

    setAddedBookId(book.id);
    setTimeout(() => setAddedBookId(null), 900);
    setOpenMenu(null);
  }, [getBookCurrentShelf, removeBookFromList, addBookToList]);

  return (
    <div className="search-page">
      <div className="search-header">
        <button className="search-back" onClick={() => navigate("/")}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div className="search-input-wrapper">
          <button className="search-input-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search by title or author"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <div className="search-results">
        {loading ? (
          <div className="search-loading">Searching...</div>
        ) : results.length > 0 ? (
          <div className="search-grid">
            {results.map((book) => {
              const currentShelf = getBookCurrentShelf(book);
              return (
              <div key={book.id} className={`search-book${openMenu === book.id ? " search-book--active" : ""}${addedBookId === book.id ? " search-book--added" : ""}`}>
                <div className="search-book-cover">
                  <div
                    className="search-cover"
                    style={{
                      backgroundImage: book.imageLinks
                        ? `url("${book.imageLinks.thumbnail}")`
                        : "none",
                    }}
                  />
                  <div className="search-book-add" ref={openMenu === book.id ? menuRef : null}>
                    <button
                      className={`shelf-changer-btn${addedBookId === book.id ? " shelf-changer-btn--added" : ""}`}
                      onClick={() => setOpenMenu(openMenu === book.id ? null : book.id)}
                      aria-label="Add to shelf"
                    >
                      {addedBookId === book.id ? (
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                      )}
                    </button>
                    {openMenu === book.id && (
                      <div className="shelf-menu search-shelf-menu">
                        <div className="shelf-menu-header">Add to...</div>
                        <button
                          className={`shelf-menu-item${currentShelf === "currentlyReading" ? " shelf-menu-item--active" : ""}`}
                          onClick={() => addToShelf(book, "currentlyReading")}
                        >
                          Currently Reading
                        </button>
                        <button
                          className={`shelf-menu-item${currentShelf === "wantToRead" ? " shelf-menu-item--active" : ""}`}
                          onClick={() => addToShelf(book, "wantToRead")}
                        >
                          Want to Read
                        </button>
                        <button
                          className={`shelf-menu-item${currentShelf === "read" ? " shelf-menu-item--active" : ""}`}
                          onClick={() => addToShelf(book, "read")}
                        >
                          Read
                        </button>
                        {currentShelf && !currentShelf.startsWith("custom-") && (
                          <button
                            className="shelf-menu-item shelf-menu-item--none"
                            onClick={() => addToShelf(book, "none")}
                          >
                            None
                          </button>
                        )}
                        {booklists.map((list) => (
                          <button
                            key={list.id}
                            className={`shelf-menu-item${currentShelf === `custom-${list.id}` ? " shelf-menu-item--active" : ""}`}
                            onClick={() => addToShelf(book, `custom-${list.id}`)}
                          >
                            {list.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="search-book-title">{book.title}</div>
                <div className="search-book-authors">
                  {book.authors ? book.authors.join(", ") : "Unknown"}
                </div>
              </div>
              );
            })}
          </div>
        ) : query.trim() ? (
          <div className="search-empty">
            <p>No results found</p>
          </div>
        ) : (
          <div className="search-empty">
            <p>Search for books by title or author</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
