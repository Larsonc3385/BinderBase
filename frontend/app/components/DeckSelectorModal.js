"use client";

export default function DeckSelectorModal({ decks, currentDeckId, onSelect, onDelete, onClose }) {
  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={h2Style}>Select a Deck</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 380, overflowY: "auto", marginBottom: "1rem" }}>
          {decks.length === 0 ? (
            <p style={{ textAlign: "center", fontStyle: "italic", color: "var(--text-muted)", padding: "1.5rem 0" }}>
              No decks yet — create one!
            </p>
          ) : (
            decks.map((deck) => (
              <div
                key={deck._id}
                onClick={() => onSelect(deck)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.7rem 0.9rem",
                  borderRadius: 6,
                  border: `1px solid ${currentDeckId === deck._id ? "var(--gold)" : "var(--gold-dim)"}`,
                  background: currentDeckId === deck._id ? "rgba(61,46,14,0.3)" : "var(--sunken)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseOver={(e) => { if (currentDeckId !== deck._id) { e.currentTarget.style.borderColor = "var(--gold-mid)"; e.currentTarget.style.background = "var(--elevated)"; } }}
                onMouseOut={(e) => { if (currentDeckId !== deck._id) { e.currentTarget.style.borderColor = "var(--gold-dim)"; e.currentTarget.style.background = "var(--sunken)"; } }}
              >
                <div>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.9rem", fontWeight: 600, color: "var(--gold-bright)", margin: 0 }}>
                    {deck.name}
                  </p>
                  <p style={{ fontStyle: "italic", fontSize: "0.78rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                    {deck.format}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(deck); }}
                  style={removeBtnStyle}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <button onClick={onClose} style={{ ...btnGhostStyle, width: "100%" }}>Close</button>
      </div>
    </div>
  );
}

const backdropStyle = { position: "fixed", inset: 0, background: "rgba(10,7,0,0.88)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" };
const modalStyle = { background: "var(--surface)", border: "1px solid var(--gold)", borderRadius: 8, padding: "1.75rem", width: "min(520px, 95vw)", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 16px 48px rgba(0,0,0,0.8)" };
const h2Style = { fontFamily: "'Cinzel Decorative', serif", fontSize: "1.15rem", fontWeight: 700, color: "var(--gold-bright)", marginBottom: "1.25rem" };
const removeBtnStyle = { width: 22, height: 22, borderRadius: 3, border: "1px solid var(--gold-dim)", background: "transparent", color: "var(--text-muted)", fontSize: "1rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const btnGhostStyle = { padding: "0.45rem 1rem", borderRadius: 4, border: "1px solid var(--gold-dim)", background: "transparent", color: "var(--text-muted)", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", letterSpacing: "0.07em", textTransform: "uppercase" };