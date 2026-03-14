import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as BooksAPI from "../../api/BooksAPI";
import BooklistModal from "../../components/ui/Modals/BooklistModal";
import { useBooklist } from "../../components/contexts/Booklist";
import Shelf from "../../components/ui/Shelf";
import CustomShelf from "../../components/ui/CustomShelf";
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
  const { booklists, addBooklist, editBooklist, removeBooklist, addBookToList, removeBookFromList, moveBookBetweenLists } = useBooklist();
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

  // ── Booklist modal state ─────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [openTab, setOpenTab] = useState(null);

  /**
   * Moves a book between shelves using BooksAPI.update().
   * Updates local state optimistically after the API call succeeds.
   */
  const moveBook = useCallback((book, fromShelf, toShelf) => {
    if (fromShelf === toShelf) return;

    const fromCustom = fromShelf.startsWith("custom-");
    const toCustom = toShelf.startsWith("custom-");
    const fromId = fromCustom ? fromShelf.replace("custom-", "") : null;
    const toId = toCustom ? toShelf.replace("custom-", "") : null;

    // custom → custom (no API call)
    if (fromCustom && toCustom) {
      moveBookBetweenLists(fromId, toId, book);
      return;
    }

    // custom → standard shelf
    if (fromCustom) {
      removeBookFromList(fromId, book.title);
      if (toShelf !== "none") {
        BooksAPI.update(book, toShelf).then(() => {
          setShelves((prev) => ({
            ...prev,
            [toShelf]: [...prev[toShelf], { ...book, shelf: toShelf }],
          }));
        });
      }
      return;
    }

    // standard → custom
    if (toCustom) {
      BooksAPI.update(book, "none").then(() => {
        setShelves((prev) => ({
          ...prev,
          [fromShelf]: prev[fromShelf].filter((b) => b.id !== book.id),
        }));
      });
      const bookData = {
        title: book.title,
        authors: Array.isArray(book.authors) ? book.authors.join(", ") : book.authors,
        coverUrl: book.imageLinks ? book.imageLinks.thumbnail : "",
        width: 90,
        height: 135,
      };
      addBookToList(toId, bookData);
      return;
    }

    // standard → standard (or "none" to remove)
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
  }, [moveBookBetweenLists, removeBookFromList, addBookToList]);

  const openCreate = useCallback(() => {
    setEditingList(null);
    setName("");
    setDescription("");
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((list) => {
    setEditingList(list);
    setName(list.name);
    setDescription(list.description);
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) return;
    if (editingList) {
      editBooklist(editingList.id, name.trim(), description.trim());
    } else {
      addBooklist(name.trim(), description.trim());
    }
    setModalOpen(false);
  }, [name, description, editingList, editBooklist, addBooklist]);

  const handleRemove = useCallback((id) => {
    removeBooklist(id);
  }, [removeBooklist]);

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

      <div className="home-top-row">
        <Shelf title="Currently Reading" shelfKey="currentlyReading" books={shelves.currentlyReading} onMove={moveBook} />
        <div className="home-custom-section">
          <div className="home-custom-header">
            <h2 className="home-section-title">My Booklists</h2>
            <button className="home-custom-add-btn" onClick={openCreate}>
              + Add
            </button>
          </div>
          {booklists.length > 0 ? (
            <div className="home-custom-tabs">
              {booklists.map((list) => (
                <CustomShelf
                  key={list.id}
                  list={list}
                  isOpen={openTab === list.id}
                  onToggle={() => setOpenTab(openTab === list.id ? null : list.id)}
                  onEdit={openEdit}
                  onRemove={handleRemove}
                  onMove={moveBook}
                />
              ))}
            </div>
          ) : (
            <div className="home-custom-empty">No booklists yet</div>
          )}
        </div>
      </div>

      <div className="home-split-row">
        <Shelf title="Want to Read" shelfKey="wantToRead" books={shelves.wantToRead} onMove={moveBook} />
        <Shelf title="Read" shelfKey="read" books={shelves.read} onMove={moveBook} />
      </div>

      <BooklistModal
        open={modalOpen}
        editingList={editingList}
        name={name}
        description={description}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default HomePage;
