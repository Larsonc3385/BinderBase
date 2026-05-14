"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CardDetailModal from "../components/CardDetailModal";

const API = "http://localhost:4000";

// ai
export default function LibraryPage() {
  const router   = useRouter();
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;

  // ── State ────────────────────────────────────────────────────────────────
  const [library, setLibrary]           = useState([]);      // local Mongo cards
  const [loadingLib, setLoadingLib]     = useState(true);
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState([]);    // Scryfall results
  const [isSearching, setIsSearching]   = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null); // for detail modal
  const [flash, setFlash]               = useState(null);
  const [importingId, setImportingId]   = useState(null);    // tracks which card is being imported

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem("username")) router.push("/login");
  }, [router]);

  // ── Load local library on mount ───────────────────────────────────────────
  useEffect(() => {
    loadLibrary();
  }, []);

  // ai
  async function loadLibrary() {
    setLoadingLib(true);
    try {
      const res  = await fetch(`${API}/api/cards`);
      const data = await res.json();
      setLibrary(data.cards || []);
    } catch (err) {
      showFlash(err.message, "error");
    } finally {
      setLoadingLib(false);
    }
  }

  // ── Flash helper ──────────────────────────────────────────────────────────
  function showFlash(msg, type = "success") {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 3000);
  }

  // ── External search (calls backend → Scryfall) ────────────────────────────
  // ai
  async function performSearch() {
    if (!searchQuery.trim()) return setSearchResults([]);
    setIsSearching(true);
    try {
      const res  = await fetch(
        `${API}/api/external/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      setSearchResults(data.cards || []);
    } catch (err) {
      showFlash(err.message, "error");
    } finally {
      setIsSearching(false);
    }
  }

  // ── Import a Scryfall result into local Mongo library ─────────────────────
  // ai
  async function importCard(card) {
    setImportingId(card.scryfallId);
    try {
      const res  = await fetch(`${API}/api/cards`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(card),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      if (data.duplicate) {
        showFlash(`"${card.name}" is already in your library.`, "error");
      } else {
        showFlash(`"${card.name}" added to library!`);
        setLibrary(prev => [data.card, ...prev]);
      }
    } catch (err) {
      showFlash(err.message, "error");
    } finally {
      setImportingId(null);
    }
  }

  // ── Remove a card from local library ─────────────────────────────────────
  async function removeCard(card) {
    if (!confirm(`Remove "${card.name}" from your library?`)) return;
    try {
      await fetch(`${API}/api/cards/${card._id}`, { method: "DELETE" });
      setLibrary(prev => prev.filter(c => c._id !== card._id));
      showFlash(`"${card.name}" removed.`);
    } catch (err) {
      showFlash(err.message, "error");
    }
  }

  // ── Check if a Scryfall card is already in the local library ─────────────
  function isInLibrary(scryfallId) {
    return library.some(c => c.scryfallId === scryfallId);
  }

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Header */}
      <header style={headerStyle}>
        <div style={headerInnerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={logoStyle}>BB</div>
            <div>
              <h1 style={h1Style}>BinderBase</h1>
              <p style={{ fontStyle: "italic", fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                Card Library
              </p>
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
            <button onClick={() => router.push("/deck")} style={btnGhostStyle}>🃏 Deck Builder</button>
            <button onClick={() => { localStorage.clear(); router.push("/login"); }} style={btnGhostStyle}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Flash */}
      {flash && (
        <div style={{
          margin: "0.75rem 1.25rem 0",
          padding: "0.5rem 0.85rem",
          borderRadius: 4,
          fontSize: "0.95rem",
          border: flash.type === "error" ? "1px solid rgba(127,29,29,0.5)" : "1px solid rgba(20,83,45,0.5)",
          background: flash.type === "error" ? "rgba(127,29,29,0.2)" : "rgba(20,83,45,0.2)",
          color: flash.type === "error" ? "#f87171" : "#6ee7b7",
        }}>
          {flash.msg}
        </div>
      )}

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* ── DISCOVER SECTION (external search + import) ── */}
        <section style={panelStyle}>
          <h2 style={sectionHeadingStyle}>🔍 Discover Cards</h2>
          <p style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Search Scryfall and import cards into your local library.
          </p>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <input
              type="search"
              placeholder="Search Scryfall… (e.g. 'lightning bolt', 'is:commander')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && performSearch()}
              style={inputStyle}
            />
            <button onClick={performSearch} disabled={isSearching} style={btnStyle}>
              {isSearching ? "Searching…" : "Search"}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div style={cardGridStyle}>
              {searchResults.map((card) => {
                const already = isInLibrary(card.scryfallId);
                return (
                  <div key={card.scryfallId} style={cardStyle}>
                    {card.image && (
                      <img src={card.image} alt={card.name}
                           style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                    )}
                    <div style={{ padding: "0.5rem 0.6rem" }}>
                      <p style={cardNameStyle}>{card.name}</p>
                      <p style={cardTypeStyle}>{card.type}</p>
                      <button
                        onClick={() => !already && importCard(card)}
                        disabled={already || importingId === card.scryfallId}
                        style={{
                          ...btnSmStyle,
                          marginTop: "0.4rem",
                          width: "100%",
                          opacity: already ? 0.5 : 1,
                          cursor: already ? "default" : "pointer",
                        }}
                      >
                        {already
                          ? "✓ In Library"
                          : importingId === card.scryfallId
                          ? "Adding…"
                          : "+ Add to Library"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !isSearching && (
            <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>No results found.</p>
          )}
        </section>

        {/* ── LOCAL LIBRARY (list view) ── */}
        <section style={panelStyle}>
          <h2 style={sectionHeadingStyle}>📚 My Library ({library.length} cards)</h2>

          {loadingLib && (
            <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>Loading…</p>
          )}

          {!loadingLib && library.length === 0 && (
            <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
              Your library is empty — search for cards above and import them!
            </p>
          )}

          {!loadingLib && library.length > 0 && (
            <div style={cardGridStyle}>
              {library.map((card) => (
                <div
                  key={card._id}
                  style={{ ...cardStyle, cursor: "pointer" }}
                  onClick={() => setSelectedCardId(card._id)}
                  title="Click for full details"
                >
                  {card.image && (
                    <img src={card.image} alt={card.name}
                         style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                  )}
                  <div style={{ padding: "0.5rem 0.6rem" }}>
                    <p style={cardNameStyle}>{card.name}</p>
                    <p style={cardTypeStyle}>{card.type}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "2px 0 0", fontStyle: "italic" }}>
                      {card.rarity} · {card.set}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeCard(card); }}
                      style={{ ...btnDangerStyle, marginTop: "0.4rem", width: "100%" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Card detail modal — loads full data via GET /api/cards/:id */}
      {selectedCardId && (
        <CardDetailModal
          cardId={selectedCardId}
          onClose={() => setSelectedCardId(null)}
        />
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const headerStyle = { background: "var(--sunken)", borderBottom: "1px solid var(--gold-mid)", position: "sticky", top: 0, zIndex: 40 };
const headerInnerStyle = { maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 1.25rem" };
const logoStyle = { width: 48, height: 48, borderRadius: 6, border: "1px solid var(--gold)", background: "var(--void)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel Decorative', serif", fontSize: 13, fontWeight: 700, color: "var(--gold-bright)", flexShrink: 0 };
const h1Style = { fontFamily: "'Cinzel Decorative', serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--gold-bright)", letterSpacing: "0.04em", lineHeight: 1, margin: 0 };
const panelStyle = { background: "var(--surface)", border: "1px solid var(--gold-dim)", borderRadius: 8, padding: "1.5rem" };
const sectionHeadingStyle = { fontFamily: "'Cinzel', serif", fontSize: "1rem", fontWeight: 600, color: "var(--gold-bright)", marginBottom: "0.75rem", marginTop: 0 };
const cardGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem" };
const cardStyle = { background: "var(--sunken)", border: "1px solid var(--gold-dim)", borderRadius: 6, overflow: "hidden", transition: "border-color 0.2s" };
const cardNameStyle = { fontFamily: "'Cinzel', serif", fontSize: "0.7rem", fontWeight: 600, color: "var(--gold-bright)", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const cardTypeStyle = { fontStyle: "italic", fontSize: "0.68rem", color: "var(--text-muted)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const inputStyle = { flex: 1, padding: "0.5rem 0.75rem", borderRadius: 4, border: "1px solid var(--gold-dim)", background: "var(--sunken)", color: "var(--text-primary)", fontFamily: "'Crimson Pro', serif", fontSize: "1rem", outline: "none" };
const btnStyle = { padding: "0.45rem 1rem", borderRadius: 4, border: "1px solid var(--gold)", background: "var(--gold-mid)", color: "var(--gold-light)", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.07em" };
const btnSmStyle = { padding: "0.3rem 0.5rem", borderRadius: 4, border: "1px solid var(--gold)", background: "var(--gold-mid)", color: "var(--gold-light)", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" };
const btnGhostStyle = { padding: "0.45rem 1rem", borderRadius: 4, border: "1px solid var(--gold-dim)", background: "transparent", color: "#a08850", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.07em" };
const btnDangerStyle = { padding: "0.25rem 0.5rem", borderRadius: 4, border: "1px solid rgba(127,29,29,0.5)", background: "rgba(127,29,29,0.15)", color: "#f87171", fontFamily: "'Cinzel', serif", fontSize: "0.62rem", fontWeight: 600, cursor: "pointer", textTransform: "uppercase" };