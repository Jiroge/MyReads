import PropTypes from "prop-types";
import BookCard from "../BookCard";
import "./index.css";

function Shelf({ title, shelfKey, books, onMove }) {
  return (
    <div className="home-shelf">
      <h2 className="home-section-title">{title}</h2>
      {books.length > 0 ? (
        <div className="home-shelf-books">
          {books.map((book) => (
            <BookCard
              key={book.id || book.title}
              book={book}
              shelfKey={shelfKey}
              onMove={onMove}
            />
          ))}
        </div>
      ) : (
        <div className="home-custom-empty">No books yet</div>
      )}
    </div>
  );
}

Shelf.propTypes = {
  title: PropTypes.string.isRequired,
  shelfKey: PropTypes.oneOf(["currentlyReading", "wantToRead", "read"]).isRequired,
  books: PropTypes.arrayOf(PropTypes.object).isRequired,
  onMove: PropTypes.func.isRequired,
};

export default Shelf;
