"use client";

export default function DeckPanel({
  deck, cards, deckCount,
  onSetCommander, onRemoveCommander,
  onUpdateQty, onRemoveCard, onClear, onHoverCard,
}) {
  return (
    <div className="card border-secondary sidebar-sticky">
      <div className="card-header d-flex align-items-center justify-content-between border-secondary">
        <div>
          <h6 className="mb-0 text-white fw-bold text-truncate" style={{ maxWidth: 160 }}>
            {deck?.name || "No Deck Selected"}
          </h6>
          <small className="text-muted fst-italic">
            {deckCount} cards · {cards.length} unique
          </small>
        </div>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={onClear}
          disabled={!deck || cards.length === 0}
        >
          Clear
        </button>
      </div>

      {/* Commander */}
      {deck && (
        <div className="card-body border-bottom border-secondary pb-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="section-label">Commander</span>
            <button className="btn btn-sm btn-outline-primary" onClick={onSetCommander}>
              {deck.commander ? "Change" : "Set"}
            </button>
          </div>
          {deck.commander ? (
            <div className="d-flex align-items-center justify-content-between bg-dark rounded p-2 border border-secondary">
              <span className="text-info fst-italic small text-truncate me-2">
                ⭐ {deck.commander}
              </span>
              <button className="btn btn-sm btn-outline-danger py-0 px-1" onClick={onRemoveCommander}>
                <i className="bi bi-x" />
              </button>
            </div>
          ) : (
            <p className="text-muted small fst-italic text-center border border-secondary rounded p-2 mb-0">
              No commander set
            </p>
          )}
        </div>
      )}

      {/* The 99 */}
      <div className="card-body p-2">
        <p className="section-label px-1 mb-2">The 99</p>
        <div className="deck-list-scroll d-flex flex-column gap-1">
          {cards.length === 0 ? (
            <p className="text-muted small fst-italic text-center py-3 mb-0">
              {deck ? "Click search results to add cards." : "Select a deck to get started."}
            </p>
          ) : (
            cards.map(card => (
              <div
                key={card._id}
                className="d-flex align-items-center gap-1 p-1 rounded border border-secondary"
                style={{ background: "rgba(0,0,0,0.3)" }}
                onMouseEnter={() => onHoverCard(card)}
                onMouseLeave={() => onHoverCard(null)}
              >
                <button className="btn btn-sm btn-outline-secondary py-0 px-1"
                        style={{ lineHeight: 1, minWidth: 22 }}
                        onClick={() => onUpdateQty(card, card.quantity - 1)}>−</button>
                <span className="text-primary fw-bold small text-center" style={{ minWidth: 16 }}>
                  {card.quantity}
                </span>
                <button className="btn btn-sm btn-outline-secondary py-0 px-1"
                        style={{ lineHeight: 1, minWidth: 22 }}
                        onClick={() => onUpdateQty(card, card.quantity + 1)}>+</button>
                <span className="flex-grow-1 small text-truncate text-light" style={{ fontSize: "0.82rem" }}>
                  {card.card_name}
                </span>
                <button className="btn btn-sm btn-outline-danger py-0 px-1"
                        style={{ lineHeight: 1 }}
                        onClick={() => onRemoveCard(card)}>
                  <i className="bi bi-x" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}