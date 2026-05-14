"use client";

import { useState } from "react";

const API = "http://localhost:4000";

export default function CommanderModal({ onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `${API}/api/cards/search?q=${encodeURIComponent(query + " is:commander")}`
      );
      const data = await res.json();
      setResults(
        (data.cards || []).filter(
          (c) =>
            c.type?.toLowerCase().includes("legendary") &&
            c.type?.toLowerCase().includes("creature")
        )
      );
    } catch (err) {
      console.error(err);
    }
    setIsSearching(false);
  }

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={h2Style}>Choose Commander</h2>
          <button onClick={onClose} style={closeBtnStyle}>×</button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            type="search"
            placeholder="Search legendary creatures…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            autoFocus
            style={inputStyle}
          />
          <button onClick={search} disabled={isSearching} style={btnStyle}>
            {isSearching ? "…" : "Search"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 380, overflowY: "auto" }}>
          {results.length === 0 && query && !isSearching && (
            <p style={{ textAlign: "center", fontStyle: "italic", color: "var(--text-muted)", padding: "1.5rem 0" }}>
              No commanders found.
            </p>
          )}
          {results.map((card) => (
            <div
              key={card.scryfallId}
              onClick={() => onSelect(card)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.6rem 0.75rem",
                borderRadius: 4,
                border: "1px solid var(--gold-dim)",
                background: "var(--sunken)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.background = "var(--elevated)"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--gold-dim)"; e.currentTarget.style.background = "var(--sunken)"; }}
            >
              {card.image && (
                <img
                  src={card.image}
                  alt={card.name}
                  style={{ width: 44, height: 60, objectFit: "cover", borderRadius: 3, flexShrink: 0 }}
                />
              )}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.85rem", fontWeight: 600, color: "var(--gold-bright)", margin: "0 0 2px" }}>
                  {card.name}
                </p>
                <p style={{ fontStyle: "italic", fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                  {card.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const backdropStyle = {
  position: "fixed", inset: 0,
  background: "rgba(10,7,0,0.88)",
  backdropFilter: "blur(4px)",
  zIndex: 9999,
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "1rem",
};

const modalStyle = {
  background: "var(--surface)",
  border: "1px solid var(--gold)",
  borderRadius: 8,
  padding: "1.75rem",
  width: "min(520px, 95vw)",
  maxHeight: "85vh",
  overflowY: "auto",
  boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
  position: "relative",
};

const h2Style = {
  fontFamily: "'Cinzel Decorative', serif",
  fontSize: "1.15rem",
  fontWeight: 700,
  color: "var(--gold-bright)",
  margin: 0,
};

const closeBtnStyle = {
  width: 28, height: 28,
  borderRadius: 3,
  border: "1px solid var(--gold-dim)",
  background: "transparent",
  color: "var(--text-muted)",
  fontSize: "1.1rem", fontWeight: 600,
  cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

const inputStyle = {
  flex: 1,
  padding: "0.5rem 0.75rem",
  borderRadius: 4,
  border: "1px solid var(--gold-dim)",
  background: "var(--sunken)",
  color: "var(--text-primary)",
  fontFamily: "'Crimson Pro', serif",
  fontSize: "1rem",
  outline: "none",
};

const btnStyle = {
  padding: "0.45rem 1rem",
  borderRadius: 4,
  border: "1px solid var(--gold)",
  background: "var(--gold-mid)",
  color: "var(--gold-light)",
  fontFamily: "'Cinzel', serif",
  fontSize: "0.7rem",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};