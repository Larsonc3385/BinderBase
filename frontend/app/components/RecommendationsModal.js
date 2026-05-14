"use client";

import { useState } from "react";

const TABS = [
  { key: "topCards", label: "Top Cards" },
  { key: "creatures", label: "Creatures" },
  { key: "instants", label: "Instants" },
  { key: "sorceries", label: "Sorceries" },
  { key: "artifacts", label: "Artifacts" },
  { key: "enchantments", label: "Enchantments" },
  { key: "lands", label: "Lands" },
];

export default function RecommendationsModal({ recommendations, isLoading, onAddCard, onClose }) {
  const [activeTab, setActiveTab] = useState("topCards");

  const cards = recommendations?.[activeTab] || [];

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={{ ...modalStyle, width: "min(700px, 95vw)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={h2Style}>💡 Card Suggestions</h2>
          <button onClick={onClose} style={closeBtnStyle}>×</button>
        </div>

        {isLoading ? (
          <p style={{ textAlign: "center", fontStyle: "italic", color: "var(--text-muted)", padding: "2rem 0" }}>Loading recommendations…</p>
        ) : !recommendations ? (
          <p style={{ textAlign: "center", fontStyle: "italic", color: "var(--text-muted)", padding: "2rem 0" }}>No recommendations available.</p>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", paddingBottom: "0.75rem", borderBottom: "1px solid var(--gold-dim)", marginBottom: "0.75rem" }}>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: 4,
                    border: "1px solid var(--gold-dim)",
                    background: activeTab === tab.key ? "var(--gold-mid)" : "var(--sunken)",
                    color: activeTab === tab.key ? "var(--gold-light)" : "var(--text-muted)",
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: 440, overflowY: "auto" }}>
              {cards.length === 0 ? (
                <p style={{ textAlign: "center", fontStyle: "italic", color: "var(--text-muted)", padding: "1.5rem 0" }}>
                  No recommendations in this category.
                </p>
              ) : (
                cards.map((card) => (
                  <div
                    key={card.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.6rem 0.75rem",
                      borderRadius: 4,
                      border: "1px solid var(--void)",
                      background: "var(--sunken)",
                      gap: "0.5rem",
                    }}
                  >
                    <div style={{ minWidth: 0, marginRight: "0.75rem" }}>
                      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.82rem", fontWeight: 600, color: "var(--gold-bright)", margin: "0 0 4px" }}>
                        {card.name}
                      </p>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {card.inclusion != null && (
                          <span style={{ padding: "0.1rem 0.45rem", borderRadius: 3, fontSize: "0.65rem", fontFamily: "'Cinzel', serif", background: "rgba(20,83,45,0.2)", color: "#6ee7b7", border: "1px solid rgba(20,83,45,0.4)" }}>
                            📊 {card.inclusion}%
                          </span>
                        )}
                        {card.synergy != null && (
                          <span style={{ padding: "0.1rem 0.45rem", borderRadius: 3, fontSize: "0.65rem", fontFamily: "'Cinzel', serif", background: "rgba(61,46,14,0.4)", color: "var(--gold-bright)", border: "1px solid var(--gold-dim)" }}>
                            ⚡ {card.synergy}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => onAddCard(card.name)} style={btnSmStyle}>+ Add</button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const backdropStyle = { position: "fixed", inset: 0, background: "rgba(10,7,0,0.88)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" };
const modalStyle = { background: "var(--surface)", border: "1px solid var(--gold)", borderRadius: 8, padding: "1.75rem", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 16px 48px rgba(0,0,0,0.8)" };
const h2Style = { fontFamily: "'Cinzel Decorative', serif", fontSize: "1.15rem", fontWeight: 700, color: "var(--gold-bright)", margin: 0 };
const closeBtnStyle = { width: 28, height: 28, borderRadius: 3, border: "1px solid var(--gold-dim)", background: "transparent", color: "var(--text-muted)", fontSize: "1.1rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const btnSmStyle = { padding: "0.3rem 0.75rem", borderRadius: 4, border: "1px solid var(--gold)", background: "var(--gold-mid)", color: "var(--gold-light)", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" };