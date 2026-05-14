"use client";

export default function DeckSelectorModal({ decks, currentDeckId, onSelect, onDelete, onClose }) {
  return (
    <div className="modal d-block modal-open-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
        <div className="modal-content border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title text-white">
              <i className="bi bi-collection me-2 text-primary" />Select a Deck
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">
            {decks.length === 0 ? (
              <p className="text-muted fst-italic text-center py-3">No decks yet — create one!</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {decks.map(deck => (
                  <div key={deck._id}
                       onClick={() => onSelect(deck)}
                       className={`d-flex align-items-center justify-content-between p-3 rounded border card-hover
                         ${currentDeckId === deck._id ? "border-primary bg-primary bg-opacity-10" : "border-secondary"}`}>
                    <div>
                      <p className="fw-semibold text-white mb-0">{deck.name}</p>
                      <small className="text-muted fst-italic">{deck.format}</small>
                    </div>
                    <button className="btn btn-sm btn-outline-danger ms-2"
                            onClick={e => { e.stopPropagation(); onDelete(deck); }}>
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer border-secondary">
            <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}