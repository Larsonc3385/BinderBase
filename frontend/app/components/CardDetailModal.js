"use client";

import { useState, useEffect } from "react";

const API = "http://localhost:4000";

// ai
export default function CardDetailModal({ cardId, onClose }) {
  const [card, setCard]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Fetch full card details from local library when modal opens
  useEffect(() => {
    async function loadCard() {
      try {
        const res  = await fetch(`${API}/api/cards/${cardId}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to load card");
        setCard(data.card);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCard();
  }, [cardId]);

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={h2Style}>{card ? card.name : "Card Details"}</h2>
          <button onClick={onClose} style={closeBtnStyle}>×</button>
        </div>

        {loading && (
          <p style={{ fontStyle: "italic", color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>
            Loading…
          </p>
        )}

        {error && (
          <p style={{ color: "#f87171", textAlign: "center", padding: "2rem 0" }}>{error}</p>
        )}

        {card && (
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {/* Card image */}
            {card.image && (
              <img
                src={card.image}
                alt={card.name}
                style={{ width: 220, borderRadius: 8, border: "1px solid var(--gold)", flexShrink: 0 }}
              />
            )}

            {/* Card details */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <DetailRow label="Type"      value={card.type} />
              <DetailRow label="Mana Cost" value={card.manaCost} />
              <DetailRow label="Colors"    value={card.colors?.join(", ") || "Colorless"} />
              <DetailRow label="Set"       value={card.set} />
              <DetailRow label="Rarity"    value={card.rarity} />

              {card.oracleText && (
                <div style={{ marginTop: "1rem" }}>
                  <span style={labelStyle}>Oracle Text</span>
                  <p style={{ fontStyle: "italic", fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.6, marginTop: 4 }}>
                    {card.oracleText}
                  </p>
                </div>
              )}

              <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                Added to library {new Date(card.addedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ai
function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <span style={labelStyle}>{label}</span>
      <span style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginLeft: 8 }}>{value}</span>
    </div>
  );
}

const labelStyle = {
  fontFamily: "'Cinzel', serif",
  fontSize: "0.65rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

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
  width: "min(640px, 95vw)",
  maxHeight: "85vh",
  overflowY: "auto",
  boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
  position: "relative",
};

const h2Style = {
  fontFamily: "'Cinzel Decorative', serif",
  fontSize: "1.1rem",
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