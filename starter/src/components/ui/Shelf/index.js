/**
 * Shelf — presentational component that renders a titled grid of BookCards.
 *
 * Props:
 *   title    — section heading string (e.g. "Currently Reading")
 *   shelfKey — passed through to each BookCard so it knows which shelf it's on
 *   books    — array of book objects to display
 *   onMove(book, fromShelf, toShelf) — relayed up to HomePage when a book is moved
 */
import BookCard from "../BookCard";
import "./index.css";

function Shelf({ title, shelfKey, books, onMove }) {
  return (
    <div className="home-shelf">
      <h2 className="home-section-title">{title}</h2>
      {books.length > 0 ? (
        <div className="home-shelf-books">
          {books.map((book) => (
            <BookCard key={book.title} book={book} shelfKey={shelfKey} onMove={onMove} />
          ))}
        </div>
      ) : (
        <div className="home-custom-empty">No books yet</div>
      )}
    </div>
  );
}

export default Shelf;
