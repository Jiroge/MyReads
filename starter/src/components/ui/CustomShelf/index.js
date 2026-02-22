/**
 * CustomShelf — a collapsible accordion row for a single user-created booklist.
 *
 * Clicking the header toggles the book list open/closed (controlled by the
 * parent via `isOpen` + `onToggle`).
 *
 * Clicking a book title opens BookDetailModal so the user can read details
 * or move the book to a different shelf.
 *
 * shelfKey convention: custom booklists are identified in the move system as
 * "custom-{list.id}".  This prefix distinguishes them from the three standard
 * shelf keys ("currentlyReading", "wantToRead", "read").
 *
 * Props:
 *   list       — { id, name, description, books[] }
 *   isOpen     — whether the accordion body is visible
 *   onToggle() — called when the header is clicked
 *   onEdit(list)    — opens the edit modal for this list
 *   onRemove(id)    — deletes this list
 *   onMove(book, fromShelf, toShelf) — relayed to HomePage's moveBook
 */
import { useState, useCallback } from "react";
import BookDetailModal from "../Modals/BookDetailModal";
import "./index.css";

function CustomShelf({ list, isOpen, onToggle, onEdit, onRemove, onMove }) {
  const [selectedBook, setSelectedBook] = useState(null);

  const shelfKey = `custom-${list.id}`;

  const handleMove = useCallback((book, toShelf) => {
    if (onMove) {
      onMove(book, shelfKey, toShelf);
    }
    setSelectedBook(null);
  }, [onMove, shelfKey]);

  return (
    <div className="home-tab">
      <button className={`home-tab-header${isOpen ? " home-tab-header--active" : ""}`} onClick={onToggle}>
        <div className="home-tab-info">
          <svg className={`home-tab-arrow${isOpen ? " home-tab-arrow--open" : ""}`} viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
          <span className="home-tab-name">{list.name}</span>
          {/* Show an info icon if the list has a description; tooltip on hover */}
          {list.description && (
            <span className="home-tab-info-icon" title={list.description}>
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </span>
          )}
        </div>
        <span className="home-tab-count">{list.books.length} books</span>
      </button>
      {isOpen && (
        <div className="home-tab-content">
          <div className="home-tab-actions">
            <button className="home-shelf-btn" onClick={() => onEdit(list)}>Edit</button>
            <button className="home-shelf-btn home-shelf-btn--danger" onClick={() => onRemove(list.id)}>Remove</button>
          </div>
          {list.books.length > 0 ? (
            <ul className="home-tab-booklist">
              {list.books.map((book) => (
                // Clicking a book opens the detail modal
                <li key={book.title} className="home-tab-book-item" onClick={() => setSelectedBook(book)}>
                  <span className="home-tab-book-title">{book.title}</span>
                  <span className="home-tab-book-authors">{book.authors}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="home-custom-empty">No books yet</div>
          )}
        </div>
      )}
      {/* Modal is always mounted but hidden when selectedBook is null */}
      <BookDetailModal
        open={!!selectedBook}
        book={selectedBook}
        shelfKey={shelfKey}
        onMove={handleMove}
        onClose={() => setSelectedBook(null)}
      />
    </div>
  );
}

export default CustomShelf;
