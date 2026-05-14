"use client";

export default function DeckPanel({
  deck,
  cards,
  deckCount,
  onSetCommander,
  onRemoveCommander,
  onUpdateQty,
  onRemoveCard,
  onClear,
  onHoverCard,
}) {
  return (
    <aside
      style={{
        background: "var(--surface)",
        border: "1px solid var(--gold-dim)",
        borderRadius: 8,
        padding: "1.25rem",
        position: "sticky",
        top: "5rem",
        height: "fit-content",
        maxHeight: "calc(100vh - 6rem)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingBottom: "0.75rem",
          marginBottom: "0.75rem",
          borderBottom: "1px solid var(--gold-dim)",
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--gold-bright)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              margin: 0,
            }}
          >
            {deck?.name || "No Deck Selected"}
          </h3>
          <p style={{ fontStyle: "italic", fontSize: "0.8rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
            {deckCount} cards · {cards.length} unique
          </p>
        </div>
        <button onClick={onClear} disabled={!deck || cards.length === 0} style={btnSmStyle}>
          Clear
        </button>
      </div>

      {/* Commander section */}
      {deck && (
        <div
          style={{
            marginBottom: "0.75rem",
            padding: "0.75rem",
            borderRadius: 6,
            border: "1px solid var(--gold-mid)",
            background: "rgba(61,46,14,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={sectionLabelStyle}>Commander</span>
            <button onClick={onSetCommander} style={btnSmStyle}>
              {deck.commander ? "Change" : "Set"}
            </button>
          </div>

          {deck.commander ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.5rem",
                padding: "0.4rem 0.6rem",
                background: "var(--sunken)",
                borderRadius: 4,
                border: "1px solid var(--gold-dim)",
              }}
            >
              <span style={{ fontStyle: "italic", fontWeight: 600, color: "var(--gold-light)", flex: 1, fontSize: "0.9rem" }}>
                ⭐ {deck.commander}
              </span>
              <button onClick={onRemoveCommander} style={removeBtnStyle}>×</button>
            </div>
          ) : (
            <p
              style={{
                textAlign: "center",
                fontStyle: "italic",
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                padding: "0.5rem",
                border: "1px dashed var(--gold-dim)",
                borderRadius: 4,
                margin: 0,
              }}
            >
              No commander set
            </p>
          )}
        </div>
      )}

      {/* The 99 label */}
      <span style={sectionLabelStyle}>The 99</span>

      {/* Card list */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {cards.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 0", fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {deck ? "Click search results to add cards." : "Select a deck to get started."}
          </div>
        ) : (
          cards.map((card) => (
            <div
              key={card._id}
              onMouseEnter={() => onHoverCard(card)}
              onMouseLeave={() => onHoverCard(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.35rem 0.5rem",
                borderRadius: 4,
                border: "1px solid var(--void)",
                background: "var(--sunken)",
              }}
            >
              <button onClick={() => onUpdateQty(card, card.quantity - 1)} style={qtyBtnStyle}>−</button>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", fontWeight: 600, color: "var(--gold)", minWidth: 16, textAlign: "center" }}>
                {card.quantity}
              </span>
              <button onClick={() => onUpdateQty(card, card.quantity + 1)} style={qtyBtnStyle}>+</button>

              <span
                style={{
                  flex: 1,
                  fontSize: "0.9rem",
                  color: "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {card.card_name}
              </span>

              <button onClick={() => onRemoveCard(card)} style={removeBtnStyle}>×</button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

const sectionLabelStyle = {
  display: "block",
  fontFamily: "'Cinzel', serif",
  fontSize: "0.65rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  marginBottom: "0.4rem",
};

const btnSmStyle = {
  padding: "0.3rem 0.75rem",
  borderRadius: 4,
  border: "1px solid var(--gold)",
  background: "var(--gold-mid)",
  color: "var(--gold-light)",
  fontFamily: "'Cinzel', serif",
  fontSize: "0.65rem",
  fontWeight: 600,
  textTransform: "uppercase",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const qtyBtnStyle = {
  width: 22,
  height: 22,
  borderRadius: 3,
  border: "1px solid var(--gold-dim)",
  background: "transparent",
  color: "var(--gold-mid)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1rem",
  fontWeight: 600,
  lineHeight: 1,
  flexShrink: 0,
};

const removeBtnStyle = {
  width: 22,
  height: 22,
  borderRadius: 3,
  border: "1px solid var(--gold-dim)",
  background: "transparent",
  color: "var(--text-muted)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1rem",
  fontWeight: 600,
  lineHeight: 1,
  flexShrink: 0,
};