import { useState, useEffect, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../components/contexts/Auth";
import { search } from "../../api/BooksAPI";
import "./index.css";

// How many unique cover URLs we need before building the background grid.
// Fetching stops as soon as this threshold is met, keeping API calls minimal.
const MIN_COVERS = 15;

// Number of cover images displayed per row in the animated background grid.
const COVERS_PER_ROW = 12;

// Total number of scrolling rows rendered in the background.
const ROW_COUNT = 5;

// All 26 letters used as search queries to fetch varied book covers from the API.
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

// Fisher-Yates shuffle — returns a new randomly ordered copy of the array
// without mutating the original, used to randomise both the query order
// and the cover layout so every login looks different.
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Converts a flat list of cover URLs into ROW_COUNT rows, each containing
// COVERS_PER_ROW images. Each row is then tripled so the CSS scroll animation
// can loop seamlessly without a visible jump at the edges.
function buildRows(covers) {
  if (covers.length === 0) return [];

  // If we have fewer covers than needed, repeat the array until we have enough.
  const needed = COVERS_PER_ROW * ROW_COUNT;
  let pool = [...covers];
  while (pool.length < needed) {
    pool = [...pool, ...covers];
  }

  const shuffled = shuffleArray(pool);

  return Array.from({ length: ROW_COUNT }, (_, i) => {
    const slice = shuffled.slice(i * COVERS_PER_ROW, (i + 1) * COVERS_PER_ROW);
    // Triple the slice so CSS translateX(-33.33%) creates an infinite loop
    // without the grid ever running out of content mid-animation.
    return [...slice, ...slice, ...slice];
  });
}

function LoginPage() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState([]);
  // `loading` stays true until the cover fetch completes (or times out),
  // keeping the login form hidden while the background is being prepared.
  const [loading, setLoading] = useState(true);
  const { username, login } = useAuth();
  const navigate = useNavigate();

  // Fetch book covers from the API on mount to populate the animated background.
  // Letters are shuffled so different covers appear on each page load.
  // The `cancelled` flag prevents a setState call after the component unmounts
  // (e.g. if the user is already logged in and gets redirected immediately).
  useEffect(() => {
    let cancelled = false;

    // Safety net: if the API takes more than 5 s, reveal the login form anyway
    // so the user is never stuck waiting indefinitely.
    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 5000);

    const letters = shuffleArray(LETTERS);

    async function fetchCovers() {
      const covers = [];
      let idx = 0;

      // Search one letter at a time until we have enough unique cover images.
      while (covers.length < MIN_COVERS && idx < letters.length) {
        try {
          const books = await search(letters[idx], 20);
          if (Array.isArray(books)) {
            for (const book of books) {
              const url = book.imageLinks?.thumbnail;
              if (url) covers.push(url);
            }
          }
        } catch {
          // A single failed query is non-fatal — skip to the next letter.
        }
        idx++;
      }

      if (!cancelled) {
        if (covers.length > 0) setRows(buildRows(covers));
        // Reveal the login form once the background is ready (or if no covers
        // were found, reveal it immediately so the user can still log in).
        setLoading(false);
      }
    }

    fetchCovers();

    // Cleanup: ignore the result if the component has already unmounted.
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  // Trim whitespace before logging in so " admin " and "admin" are treated the same.
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (input.trim()) {
      login(input.trim());
      navigate("/");
    }
  }, [input, login, navigate]);

  // If a session already exists, skip the login screen entirely.
  if (username) {
    return <Navigate to="/" />;
  }

  return (
    <div className="login-page">
      {/* ── Animated background ── */}
      <div className="login-bg">
        {/* Grid of scrolling book cover rows.
            Even-indexed rows scroll left, odd-indexed rows scroll right
            to create a layered, cinematic effect. */}
        <div className="login-bg-grid">
          {rows.map((row, ri) => (
            <div
              key={ri}
              className={`login-bg-row ${ri % 2 === 0 ? "login-bg-row--left" : "login-bg-row--right"}`}
            >
              {row.map((url, ci) => (
                <div
                  key={ci}
                  className="login-bg-cover"
                  style={{ backgroundImage: `url("${url}")` }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Dark gradient overlay that fades the background and adds colour tints,
            ensuring the login card stays readable on any cover image. */}
        <div className="login-bg-overlay" />
      </div>

      {/* ── Spinner (shown while covers are being fetched) ── */}
      {loading ? (
        <div className="login-loading">
          <div className="login-spinner" />
        </div>
      ) : (
        /* ── Login card (fades in once background is ready) ── */
        <form className="login-card" onSubmit={handleSubmit}>
          <h1>MyReads</h1>
          <p className="login-card-subtitle">Track your reading journey</p>
          <input
            type="text"
            placeholder="Enter your username"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">Log In</button>
        </form>
      )}
    </div>
  );
}

export default LoginPage;
