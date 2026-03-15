import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import "./index.css";

function BookCard({ book, shelfKey, onMove }) {
  const [open, setOpen] = useState(false);
  const [flipLeft, setFlipLeft] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

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
            style={{
              backgroundImage: book.imageLinks
                ? `url("${book.imageLinks.thumbnail}")`
                : "none",
            }}
          ></div>
          <div className="book-shelf-changer" ref={menuRef}>
            <button
              ref={btnRef}
              className="shelf-changer-btn"
              onClick={() => {
                if (!open && btnRef.current) {
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
                <button className="shelf-menu-item shelf-menu-item--none" onClick={() => handleSelect("none")}>
                  None
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="book-title">{book.title}</div>
        <div className="book-authors">
          {Array.isArray(book.authors) ? book.authors.join(", ") : book.authors}
        </div>
      </div>
    </div>
  );
}

BookCard.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    authors: PropTypes.arrayOf(PropTypes.string),
    imageLinks: PropTypes.shape({
      thumbnail: PropTypes.string,
    }),
  }).isRequired,
  shelfKey: PropTypes.oneOf(["currentlyReading", "wantToRead", "read"]).isRequired,
  onMove: PropTypes.func.isRequired,
};

export default BookCard;
