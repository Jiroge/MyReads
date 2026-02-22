/**
 * Booklist context — manages user-created custom booklists.
 *
 * Data shape stored in localStorage ("customBooklists"):
 *   [{ id: string, name: string, description: string, books: BookData[] }]
 *
 * BookData shape (mirrors the object stored in the shelves):
 *   { title, authors, coverUrl, width, height }
 *
 * The context exposes granular operations so callers never mutate state
 * directly.  All setBooklists calls go through the functional updater form
 * to avoid stale-closure issues.
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const BooklistContext = createContext();

export function BooklistProvider({ children }) {
  const [booklists, setBooklists] = useState(() => {
    const stored = localStorage.getItem("customBooklists");
    return stored ? JSON.parse(stored) : [];
  });

  // Mirror every state change to localStorage automatically.
  useEffect(() => {
    localStorage.setItem("customBooklists", JSON.stringify(booklists));
  }, [booklists]);

  /** Creates a new empty booklist with a timestamp-based id. */
  const addBooklist = useCallback((name, description) => {
    setBooklists((prev) => [...prev, { id: String(Date.now()), name, description, books: [] }]);
  }, []);

  const editBooklist = useCallback((id, name, description) => {
    setBooklists((prev) => prev.map((b) => (b.id === id ? { ...b, name, description } : b)));
  }, []);

  const removeBooklist = useCallback((id) => {
    setBooklists((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addBookToList = useCallback((id, book) => {
    setBooklists((prev) => prev.map((b) =>
      b.id === id ? { ...b, books: [...b.books, book] } : b
    ));
  }, []);

  const removeBookFromList = useCallback((id, bookTitle) => {
    setBooklists((prev) => prev.map((b) =>
      b.id === id ? { ...b, books: b.books.filter((bk) => bk.title !== bookTitle) } : b
    ));
  }, []);

  /**
   * Moves a book between two custom lists in a single atomic state update.
   * Using a single setBooklists call prevents a render where the book
   * temporarily exists in both lists or neither list.
   */
  const moveBookBetweenLists = useCallback((fromId, toId, book) => {
    setBooklists((prev) => prev.map((b) => {
      if (b.id === fromId) {
        return { ...b, books: b.books.filter((bk) => bk.title !== book.title) };
      }
      if (b.id === toId) {
        return { ...b, books: [...b.books, book] };
      }
      return b;
    }));
  }, []);

  /** Called on logout to clear all booklists alongside the rest of localStorage. */
  const clearBooklists = useCallback(() => {
    setBooklists([]);
  }, []);

  return (
    <BooklistContext.Provider value={{
      booklists, addBooklist, editBooklist, removeBooklist,
      addBookToList, removeBookFromList, moveBookBetweenLists, clearBooklists
    }}>
      {children}
    </BooklistContext.Provider>
  );
}

export function useBooklist() {
  return useContext(BooklistContext);
}
