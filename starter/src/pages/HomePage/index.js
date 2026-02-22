import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BooklistModal from "../../components/ui/Modals/BooklistModal";
import { useBooklist } from "../../components/contexts/Booklist";
import Shelf from "../../components/ui/Shelf";
import CustomShelf from "../../components/ui/CustomShelf";
import "./index.css";

/** Seed data shown on first load so the shelves aren't empty. */
const defaultBooks = {
  currentlyReading: [
    {
      title: "To Kill a Mockingbird",
      authors: "Harper Lee",
      coverUrl:
        "http://books.google.com/books/content?id=PGR2AwAAQBAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE73-GnPVEyb7MOCxDzOYF1PTQRuf6nCss9LMNOSWBpxBrz8Pm2_mFtWMMg_Y1dx92HT7cUoQBeSWjs3oEztBVhUeDFQX6-tWlWz1-feexS0mlJPjotcwFqAg6hBYDXuK_bkyHD-y&source=gbs_api",
      width: 90,
      height: 135,
    },
    {
      title: "Ender's Game",
      authors: "Orson Scott Card",
      coverUrl:
        "http://books.google.com/books/content?id=yDtCuFHXbAYC&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE72RRiTR6U5OUg3IY_LpHTL2NztVWAuZYNFE8dUuC0VlYabeyegLzpAnDPeWxE6RHi0C2ehrR9Gv20LH2dtjpbcUcs8YnH5VCCAH0Y2ICaKOTvrZTCObQbsfp4UbDqQyGISCZfGN&source=gbs_api",
      width: 90,
      height: 132,
    },
  ],
  wantToRead: [
    {
      title: "1776",
      authors: "David McCullough",
      coverUrl:
        "http://books.google.com/books/content?id=uu1mC6zWNTwC&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE73pGHfBNSsJG9Y8kRBpmLUft9O4BfItHioHolWNKOdLavw-SLcXADy3CPAfJ0_qMb18RmCa7Ds1cTdpM3dxAGJs8zfCfm8c6ggBIjzKT7XR5FIB53HHOhnsT7a0Cc-PpneWq9zX&source=gbs_api",
      width: 90,
      height: 135,
    },
    {
      title: "Harry Potter and the Sorcerer's Stone",
      authors: "J.K. Rowling",
      coverUrl:
        "http://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE72G3gA5A-Ka8XjOZGDFLAoUeMQBqZ9y-LCspZ2dzJTugcOcJ4C7FP0tDA8s1h9f480ISXuvYhA_ZpdvRArUL-mZyD4WW7CHyEqHYq9D3kGnrZCNiqxSRhry8TiFDCMWP61ujflB&source=gbs_api",
      width: 90,
      height: 135,
    },
  ],
  read: [
    {
      title: "The Hobbit",
      authors: "J.R.R. Tolkien",
      coverUrl:
        "http://books.google.com/books/content?id=pD6arNyKyi8C&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE70Rw0CCwNZh0SsYpQTkMbvz23npqWeUoJvVbi_gXla2m2ie_ReMWPl0xoU8Quy9fk0Zhb3szmwe8cTe4k7DAbfQ45FEzr9T7Lk0XhVpEPBvwUAztOBJ6Y0QPZylo4VbB7K5iRSk&source=gbs_api",
      width: 90,
      height: 135,
    },
    {
      title: "Oh, the Places You'll Go!",
      authors: "Seuss",
      coverUrl:
        "http://books.google.com/books/content?id=1q_xAwAAQBAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE712CA0cBYP8VKbEcIVEuFJRdX1k30rjLM29Y-dw_qU1urEZ2cQ42La3Jkw6KmzMmXIoLTr50SWTpw6VOGq1leINsnTdLc_S5a5sn9Hao2t5YT7Ax1RqtQDiPNHIyXP46Rrw3aL8&source=gbs_api",
      width: 90,
      height: 122,
    },
    {
      title: "The Adventures of Tom Sawyer",
      authors: "Mark Twain",
      coverUrl:
        "http://books.google.com/books/content?id=32haAAAAMAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE72yckZ5f5bDFVIf7BGPbjA0KYYtlQ__nWB-hI_YZmZ-fScYwFy4O_fWOcPwf-pgv3pPQNJP_sT5J_xOUciD8WaKmevh1rUR-1jk7g1aCD_KeJaOpjVu0cm_11BBIUXdxbFkVMdi&source=gbs_api",
      width: 90,
      height: 135,
    },
  ],
};

function HomePage() {
  const { booklists, addBooklist, editBooklist, removeBooklist, addBookToList, removeBookFromList, moveBookBetweenLists } = useBooklist();
  const navigate = useNavigate();

  // Standard shelf state — initialised from localStorage, falls back to defaultBooks.
  const [shelves, setShelves] = useState(() => {
    const stored = localStorage.getItem("shelves");
    if (stored) return JSON.parse(stored);
    localStorage.setItem("shelves", JSON.stringify(defaultBooks));
    return defaultBooks;
  });

  // ── Booklist modal state ─────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null); // null = create mode
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Which custom shelf accordion is currently open (by list id).
  const [openTab, setOpenTab] = useState(null);

  /** Persists the updated shelves object to both React state and localStorage. */
  const saveShelves = useCallback((updated) => {
    setShelves(updated);
    localStorage.setItem("shelves", JSON.stringify(updated));
  }, []);

  /**
   * Moves a book from one shelf to another.
   *
   * There are four cases depending on whether source / destination are
   * standard shelves or custom booklists (identified by the "custom-" prefix):
   *
   *   custom → custom   : atomic single-call via moveBookBetweenLists
   *   custom → standard : remove from list, add to shelves (or drop if "none")
   *   standard → custom : remove from shelves, add to list
   *   standard → standard: filter out of source, add to destination
   */
  const moveBook = useCallback((book, fromShelf, toShelf) => {
    if (fromShelf === toShelf) return;

    const fromCustom = fromShelf.startsWith("custom-");
    const toCustom = toShelf.startsWith("custom-");
    const fromId = fromCustom ? fromShelf.replace("custom-", "") : null;
    const toId = toCustom ? toShelf.replace("custom-", "") : null;

    // Case 1: custom → custom
    if (fromCustom && toCustom) {
      moveBookBetweenLists(fromId, toId, book);
      return;
    }

    // Case 2: custom → standard shelf
    if (fromCustom) {
      removeBookFromList(fromId, book.title);
      if (toShelf !== "none") {
        saveShelves({ ...shelves, [toShelf]: [...shelves[toShelf], book] });
      }
      return;
    }

    // Remove from standard shelf (applies to cases 3 and 4).
    const updated = { ...shelves, [fromShelf]: shelves[fromShelf].filter((b) => b.title !== book.title) };

    // Case 3: standard → custom
    if (toCustom) {
      saveShelves(updated);
      addBookToList(toId, book);
      return;
    }

    // Case 4: standard → standard (or "none" = remove only)
    if (toShelf !== "none") {
      updated[toShelf] = [...updated[toShelf], book];
    }
    saveShelves(updated);
  }, [shelves, saveShelves, moveBookBetweenLists, removeBookFromList, addBookToList]);

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

  return (
    <div className="home-page">
      {/* Search bar — navigates to /search on click (entire bar is clickable) */}
      <div className="home-search-bar" onClick={() => navigate("/search")}>
        <svg className="home-search-icon" viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <span>Search books...</span>
      </div>

      {/* Top row: Currently Reading (7/10 width) + My Booklists (3/10 width) */}
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

      {/* Bottom row: Want to Read + Read (equal width) */}
      <div className="home-split-row">
        <Shelf title="Want to Read" shelfKey="wantToRead" books={shelves.wantToRead} onMove={moveBook} />
        <Shelf title="Read" shelfKey="read" books={shelves.read} onMove={moveBook} />
      </div>

      {/* Shared modal for both creating and editing booklists */}
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
