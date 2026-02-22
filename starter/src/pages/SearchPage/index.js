import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { search, getAll } from "../../api/BooksAPI";
import { useBooklist } from "../../components/contexts/Booklist";
import "./index.css";

function SearchPage() {
  const navigate = useNavigate();
  const { booklists, addBookToList, removeBookFromList } = useBooklist();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null); // book.id of the open dropdown
  const [addedBookId, setAddedBookId] = useState(null); // book.id receiving the pulse animation
  const menuRef = useRef(null);

  // Load all shelved books on mount to populate the initial view.
  useEffect(() => {
    getAll()
      .then((books) => {
        if (Array.isArray(books)) {
          setResults(books);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    setLoading(true);
    search(query.trim(), 20)
      .then((books) => {
        if (Array.isArray(books)) {
          setResults(books);
        } else {
          setResults([]);
        }
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }, [handleSearch]);

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

  /**
   * Reads the current shelves snapshot from localStorage.
   * Initialises the key with empty shelves if it doesn't exist yet.
   */
  const getShelves = useCallback(() => {
    const stored = localStorage.getItem("shelves");
    if (stored) return JSON.parse(stored);
    const initial = { currentlyReading: [], wantToRead: [], read: [] };
    localStorage.setItem("shelves", JSON.stringify(initial));
    return initial;
  }, []);

  /**
   * Returns the shelf key the book currently belongs to, or null if unshelved.
   * Checks standard shelves first, then custom booklists.
   * Books are matched by title because search results come from the API and
   * may not share the same id as locally-stored copies.
   */
  const getBookCurrentShelf = useCallback((book) => {
    const shelves = getShelves();
    for (const key of ["currentlyReading", "wantToRead", "read"]) {
      if (shelves[key]?.some((b) => b.title === book.title)) return key;
    }
    for (const list of booklists) {
      if (list.books.some((b) => b.title === book.title)) return `custom-${list.id}`;
    }
    return null;
  }, [booklists, getShelves]);

  /**
   * Adds a book to the chosen shelf.
   *
   * Remove-before-add pattern: if the book already lives somewhere, it is
   * removed first so it never appears in two places simultaneously.
   *
   * bookData is a normalised subset of the API book object, matching the
   * shape used by the standard shelves and custom booklists.
   */
  const addToShelf = useCallback((book, shelfKey) => {
    const bookData = {
      title: book.title,
      authors: book.authors ? book.authors.join(", ") : "Unknown",
      coverUrl: book.imageLinks ? book.imageLinks.thumbnail : "",
      width: 90,
      height: 135,
    };

    // Remove from current shelf first to prevent duplicates.
    const currentShelf = getBookCurrentShelf(book);
    if (currentShelf) {
      if (currentShelf.startsWith("custom-")) {
        removeBookFromList(currentShelf.replace("custom-", ""), book.title);
      } else {
        const shelves = getShelves();
        shelves[currentShelf] = (shelves[currentShelf] || []).filter((b) => b.title !== book.title);
        localStorage.setItem("shelves", JSON.stringify(shelves));
      }
    }

    // Add to the chosen destination.
    if (shelfKey.startsWith("custom-")) {
      addBookToList(shelfKey.replace("custom-", ""), bookData);
    } else {
      const shelves = getShelves();
      shelves[shelfKey] = [...(shelves[shelfKey] || []), bookData];
      localStorage.setItem("shelves", JSON.stringify(shelves));
    }

    // Trigger the pulse animation; auto-clear after 900 ms.
    setAddedBookId(book.id);
    setTimeout(() => setAddedBookId(null), 900);
    setOpenMenu(null);
  }, [getBookCurrentShelf, getShelves, removeBookFromList, addBookToList]);

  return (
    <div className="search-page">
      <div className="search-header">
        <button className="search-back" onClick={() => navigate("/")}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div className="search-input-wrapper">
          <button className="search-input-btn" onClick={handleSearch} aria-label="Search">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search by title, author, or ISBN"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
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
                  {/* menuRef is only attached to the currently-open dropdown
                      so the click-outside handler can target it correctly */}
                  <div className="search-book-add" ref={openMenu === book.id ? menuRef : null}>
                    <button
                      className={`shelf-changer-btn${addedBookId === book.id ? " shelf-changer-btn--added" : ""}`}
                      onClick={() => setOpenMenu(openMenu === book.id ? null : book.id)}
                      aria-label="Add to shelf"
                    >
                      {/* Swap to a checkmark icon during the confirmation pulse */}
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
                        {/* shelf-menu-item--active highlights the current shelf */}
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
        ) : (
          <div className="search-empty">
            <p>No results found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
