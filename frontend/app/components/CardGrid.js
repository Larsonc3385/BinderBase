"use client";

export default function CardGrid({ cards, onAddCard, onHover, searchQuery }) {
  if (cards.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem", fontStyle: "italic", color: "var(--text-muted)" }}>
        {searchQuery ? "No cards found — try a different search." : "Search for cards to add to your deck."}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
        gap: "0.75rem",
      }}
    >
      {cards.map((card) => (
        <div
          key={card.scryfallId}
          onClick={() => onAddCard(card)}
          onMouseEnter={() => onHover(card)}
          onMouseLeave={() => onHover(null)}
          title={`Add ${card.name}`}
          style={{
            background: "var(--sunken)",
            border: "1px solid var(--gold-dim)",
            borderRadius: 6,
            overflow: "hidden",
            cursor: "pointer",
            transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "var(--gold)";
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.6)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "var(--gold-dim)";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {card.image ? (
            <img
              src={card.image}
              alt={card.name}
              style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 120,
                background: "var(--void)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontStyle: "italic",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
              }}
            >
              No Image
            </div>
          )}
          <div style={{ padding: "0.5rem 0.6rem" }}>
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--gold-bright)",
                lineHeight: 1.3,
                margin: "0 0 2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {card.name}
            </p>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {card.type}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}