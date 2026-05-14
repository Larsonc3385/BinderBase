"use client";

import { useState } from "react";

const TABS = [
  { key: "topCards",     label: "Top Cards" },
  { key: "creatures",    label: "Creatures" },
  { key: "instants",     label: "Instants" },
  { key: "sorceries",    label: "Sorceries" },
  { key: "artifacts",    label: "Artifacts" },
  { key: "enchantments", label: "Enchantments" },
  { key: "lands",        label: "Lands" },
];

// ai
export default function RecommendationsModal({ recommendations, isLoading, onAddCard, onClose }) {
  const [activeTab, setActiveTab] = useState("topCards");
  const cards = recommendations?.[activeTab] || [];

  return (
    <div className="modal d-block modal-open-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
        <div className="modal-content border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title text-white">
              <i className="bi bi-lightbulb me-2 text-warning" />Card Suggestions
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="text-muted mt-2">Loading recommendations…</p>
              </div>
            ) : !recommendations ? (
              <p className="text-muted fst-italic text-center py-4">No recommendations available.</p>
            ) : (
              <>
                <ul className="nav nav-pills flex-wrap gap-1 mb-3">
                  {TABS.map(tab => (
                    <li key={tab.key} className="nav-item">
                      <button className={`nav-link py-1 px-2 small ${activeTab === tab.key ? "active" : ""}`}
                              onClick={() => setActiveTab(tab.key)}>
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="d-flex flex-column gap-2">
                  {cards.length === 0 ? (
                    <p className="text-muted fst-italic text-center py-3">No recommendations in this category.</p>
                  ) : (
                    cards.map(card => (
                      <div key={card.name}
                           className="d-flex align-items-center justify-content-between p-2 rounded border border-secondary"
                           style={{ background: "rgba(0,0,0,0.3)" }}>
                        <div>
                          <p className="fw-semibold text-info mb-1 small">{card.name}</p>
                          <div className="d-flex gap-2">
                            {card.inclusion != null && (
                              <span className="badge bg-success bg-opacity-25 text-success border border-success"
                                    style={{ fontSize: "0.65rem" }}>
                                📊 {card.inclusion}%
                              </span>
                            )}
                            {card.synergy != null && (
                              <span className="badge bg-primary bg-opacity-25 text-info border border-primary"
                                    style={{ fontSize: "0.65rem" }}>
                                ⚡ {card.synergy}%
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="btn btn-sm btn-outline-primary ms-3"
                                onClick={() => onAddCard(card.name)}>
                          + Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}