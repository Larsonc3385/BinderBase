"use client";

export default function CardGrid({ cards, onAddCard, onHover, searchQuery }) {
  if (cards.length === 0) {
    return (
      <div className="text-center text-muted fst-italic py-5">
        {searchQuery ? "No cards found — try a different search." : "Search for cards to add to your deck."}
      </div>
    );
  }

  return (
    <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
      {cards.map(card => (
        <div key={card.scryfallId} className="col">
          <div
            className="card h-100 card-hover border-secondary"
            onClick={() => onAddCard(card)}
            onMouseEnter={() => onHover(card)}
            onMouseLeave={() => onHover(null)}
            title={`Add ${card.name}`}
          >
            {card.image
              ? <img src={card.image} alt={card.name} className="card-img-cover" />
              : <div className="card-img-cover d-flex align-items-center justify-content-center text-muted small fst-italic"
                     style={{ background: "#1a0533" }}>No Image</div>
            }
            <div className="card-body p-2">
              <p className="card-title small fw-semibold text-truncate mb-0"
                 style={{ color: "#e2b8ff", fontSize: "0.72rem" }}>{card.name}</p>
              <p className="card-text text-muted fst-italic text-truncate mb-0"
                 style={{ fontSize: "0.68rem" }}>{card.type}</p>
              {card.manaCost && (
                <span className="badge bg-secondary mt-1" style={{ fontSize: "0.6rem" }}>
                  {card.manaCost}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}