/**
 * BookDetailModal — shows a book's cover, title, and authors, plus a
 * row of buttons to move it to any other shelf or booklist.
*/
import { useBooklist } from "../../../contexts/Booklist";
import Modal from "..";
import "./index.css";

function BookDetailModal({ open, book, shelfKey, onMove, onClose }) {
  const { booklists } = useBooklist();

  // Guard: Modal renders nothing when book is null (e.g. before first click).
  if (!book) return null;

  // Strip the "custom-" prefix to get the raw list id so we can filter it
  // out of the move options — no point offering "move to where it already is".
  const currentListId = shelfKey ? shelfKey.replace("custom-", "") : null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="book-detail">
        <div className="book-detail-cover">
          <div
            className="book-detail-cover-img"
            style={{ backgroundImage: `url("${book.coverUrl}")` }}
          />
        </div>
        <div className="book-detail-info">
          <h3 className="book-detail-title">{book.title}</h3>
          <p className="book-detail-authors">{book.authors}</p>
        </div>
        {onMove && (
          <div className="book-detail-move">
            <span className="book-detail-move-label">Move to...</span>
            <div className="book-detail-move-options">
              <button className="book-detail-move-btn" onClick={() => onMove(book, "currentlyReading")}>
                Currently Reading
              </button>
              <button className="book-detail-move-btn" onClick={() => onMove(book, "wantToRead")}>
                Want to Read
              </button>
              <button className="book-detail-move-btn" onClick={() => onMove(book, "read")}>
                Read
              </button>
              {/* Only show custom booklists the book isn't already in */}
              {booklists
                .filter((bl) => bl.id !== currentListId)
                .map((bl) => (
                  <button
                    key={bl.id}
                    className="book-detail-move-btn"
                    onClick={() => onMove(book, `custom-${bl.id}`)}
                  >
                    {bl.name}
                  </button>
                ))}
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
