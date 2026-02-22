/**
 * BookCard — displays a single book (cover, title, authors) with a
 * shelf-changer button that opens a dropdown menu.
 *
 * The dropdown lists every destination shelf the book can move to,
 * automatically excluding the shelf it currently lives on.
 *
 * Props:
 *   book      — { title, authors, coverUrl }
 *   shelfKey  — current shelf identifier:
 *                 "currentlyReading" | "wantToRead" | "read" | "custom-{id}"
 *   onMove(book, fromShelf, toShelf) — called when the user picks a destination
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useBooklist } from "../../contexts/Booklist";
import "./index.css";

function BookCard({ book, shelfKey, onMove }) {
  const { booklists } = useBooklist();
  const [open, setOpen] = useState(false);
  // When the menu would overflow the right edge of the shelf grid it flips
  // to open leftward instead.
  const [flipLeft, setFlipLeft] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // Close the menu when the user clicks anywhere outside it.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = useCallback((value) => {
    if (onMove) {
      onMove(book, shelfKey, value);
    }
    setOpen(false);
  }, [onMove, book, shelfKey]);

  return (
    <div className={`book-card${open ? " book-card--active" : ""}`}>
      <div className="book">
        <div className="book-top">
          <div
            className="book-cover"
            style={{ backgroundImage: `url("${book.coverUrl}")` }}
          ></div>
          <div className="book-shelf-changer" ref={menuRef}>
            <button
              ref={btnRef}
              className="shelf-changer-btn"
              onClick={() => {
                if (!open && btnRef.current) {
                  // Check how much space is to the right of the button.
                  // If opening rightward would exceed the shelf container's
                  // right edge, flip the menu to open leftward instead.
                  const rect = btnRef.current.getBoundingClientRect();
                  const container = btnRef.current.closest(".home-shelf-books");
                  const rightEdge = container
                    ? container.getBoundingClientRect().right
                    : window.innerWidth;
                  setFlipLeft(rect.right + 200 > rightEdge);
                }
                setOpen(!open);
              }}
              aria-label="Move to shelf"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M7 10l5 5 5-5z" />
              </svg>
            </button>
            {open && (
              <div className={`shelf-menu${flipLeft ? " shelf-menu--left" : ""}`}>
                <div className="shelf-menu-header">Move to...</div>
                {/* Render every shelf option except the one the book is already on */}
                {shelfKey !== "currentlyReading" && (
                  <button className="shelf-menu-item" onClick={() => handleSelect("currentlyReading")}>
                    Currently Reading
                  </button>
                )}
                {shelfKey !== "wantToRead" && (
                  <button className="shelf-menu-item" onClick={() => handleSelect("wantToRead")}>
                    Want to Read
                  </button>
                )}
                {shelfKey !== "read" && (
                  <button className="shelf-menu-item" onClick={() => handleSelect("read")}>
                    Read
                  </button>
                )}
                {/* Custom booklists — exclude the one this book already belongs to */}
                {booklists
                  .filter((list) => shelfKey !== `custom-${list.id}`)
                  .map((list) => (
                    <button
                      key={list.id}
                      className="shelf-menu-item"
                      onClick={() => handleSelect(`custom-${list.id}`)}
                    >
                      {list.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
        <div className="book-title">{book.title}</div>
        <div className="book-authors">{book.authors}</div>
      </div>
    </div>
  );
}

export default BookCard;
