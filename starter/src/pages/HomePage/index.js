import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as BooksAPI from "../../api/BooksAPI";
import Shelf from "../../components/ui/Shelf";
import "./index.css";

/** Groups an array of API books by their `shelf` property. */
const groupByShelf = (books) => {
  const grouped = { currentlyReading: [], wantToRead: [], read: [] };
  books.forEach((book) => {
    if (grouped[book.shelf]) {
      grouped[book.shelf].push(book);
    }
  });
  return grouped;
};

function HomePage() {
  const navigate = useNavigate();

  const [shelves, setShelves] = useState({
    currentlyReading: [],
    wantToRead: [],
    read: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch books from the BooksAPI on mount.
  useEffect(() => {
    BooksAPI.getAll().then((books) => {
      setShelves(groupByShelf(books));
      setLoading(false);
    });
  }, []);

  /**
   * Moves a book between shelves using BooksAPI.update().
   * Updates local state after the API call succeeds.
   */
  const moveBook = useCallback((book, fromShelf, toShelf) => {
    if (fromShelf === toShelf) return;

    BooksAPI.update(book, toShelf).then(() => {
      setShelves((prev) => {
        const updated = {
          ...prev,
          [fromShelf]: prev[fromShelf].filter((b) => b.id !== book.id),
        };
        if (toShelf !== "none") {
          updated[toShelf] = [...prev[toShelf], { ...book, shelf: toShelf }];
        }
        return updated;
      });
    });
  }, []);

  if (loading) {
    return (
      <div className="home-page">
        <div className="search-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-search-bar" onClick={() => navigate("/search")}>
        <svg className="home-search-icon" viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <span>Search books...</span>
      </div>

      <Shelf title="Currently Reading" shelfKey="currentlyReading" books={shelves.currentlyReading} onMove={moveBook} />
      <div className="home-split-row">
        <Shelf title="Want to Read" shelfKey="wantToRead" books={shelves.wantToRead} onMove={moveBook} />
        <Shelf title="Read" shelfKey="read" books={shelves.read} onMove={moveBook} />
      </div>
    </div>
  );
}

export default HomePage;
