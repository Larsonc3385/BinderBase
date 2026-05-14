"use client";

import { useState, useEffect } from "react";

const API = "http://localhost:4000";

// ai
export default function CardDetailModal({ cardId, onClose }) {
  const [card, setCard]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

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
    <div className="modal d-block modal-open-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
        <div className="modal-content border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title text-white">
              {card ? card.name : "Card Details"}
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">
            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" />
              </div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}
            {card && (
              <div className="row g-4">
                {card.image && (
                  <div className="col-auto">
                    <img src={card.image} alt={card.name}
                         style={{ width: 220, borderRadius: 8, border: "1px solid #6f42c1" }} />
                  </div>
                )}
                <div className="col">
                  <table className="table table-sm table-borderless text-light mb-3">
                    <tbody>
                      {card.type     && <tr><td className="text-muted small">Type</td><td>{card.type}</td></tr>}
                      {card.manaCost && <tr><td className="text-muted small">Mana Cost</td><td>{card.manaCost}</td></tr>}
                      {card.colors   && <tr><td className="text-muted small">Colors</td><td>{card.colors.join(", ") || "Colorless"}</td></tr>}
                      {card.set      && <tr><td className="text-muted small">Set</td><td>{card.set}</td></tr>}
                      {card.rarity   && <tr><td className="text-muted small">Rarity</td>
                        <td><span className={`badge ${rarityBadge(card.rarity)}`}>{card.rarity}</span></td>
                      </tr>}
                    </tbody>
                  </table>
                  {card.oracleText && (
                    <div className="p-3 rounded border border-secondary" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <p className="section-label mb-1">Oracle Text</p>
                      <p className="text-light fst-italic small mb-0" style={{ lineHeight: 1.7 }}>
                        {card.oracleText}
                      </p>
                    </div>
                  )}
                  <p className="text-muted small fst-italic mt-3 mb-0">
                    Added {new Date(card.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function rarityBadge(rarity) {
  const map = { common: "bg-secondary", uncommon: "bg-info text-dark",
                rare: "bg-warning text-dark", mythic: "bg-danger" };
  return map[rarity?.toLowerCase()] || "bg-secondary";
}