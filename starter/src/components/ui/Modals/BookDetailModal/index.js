/**
 * BookDetailModal — shows a book's cover, title, and authors, plus a
 * row of buttons to move it to any other shelf.
 */
import Modal from "..";
import "./index.css";

function BookDetailModal({ open, book, shelfKey, onMove, onClose }) {
  if (!book) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="book-detail">
        <div className="book-detail-cover">
          <div
            className="book-detail-cover-img"
            style={{
              backgroundImage: book.imageLinks
                ? `url("${book.imageLinks.thumbnail}")`
                : "none",
            }}
          />
        </div>
        <div className="book-detail-info">
          <h3 className="book-detail-title">{book.title}</h3>
          <p className="book-detail-authors">
            {Array.isArray(book.authors) ? book.authors.join(", ") : book.authors}
          </p>
        </div>
        {onMove && (
          <div className="book-detail-move">
            <span className="book-detail-move-label">Move to...</span>
            <div className="book-detail-move-options">
              {shelfKey !== "currentlyReading" && (
                <button className="book-detail-move-btn" onClick={() => onMove(book, "currentlyReading")}>
                  Currently Reading
                </button>
              )}
              {shelfKey !== "wantToRead" && (
                <button className="book-detail-move-btn" onClick={() => onMove(book, "wantToRead")}>
                  Want to Read
                </button>
              )}
              {shelfKey !== "read" && (
                <button className="book-detail-move-btn" onClick={() => onMove(book, "read")}>
                  Read
                </button>
              )}
              <button className="book-detail-move-btn" onClick={() => onMove(book, "none")}>
                None
              </button>
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default BookDetailModal;
