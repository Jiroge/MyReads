import PropTypes from "prop-types";
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

BookDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  book: PropTypes.shape({
    title: PropTypes.string.isRequired,
    authors: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string,
    ]),
    imageLinks: PropTypes.shape({
      thumbnail: PropTypes.string,
    }),
  }),
  shelfKey: PropTypes.oneOf(["currentlyReading", "wantToRead", "read"]).isRequired,
  onMove: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

export default BookDetailModal;
