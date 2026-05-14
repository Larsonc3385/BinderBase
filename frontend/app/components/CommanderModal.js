"use client";

import { useState } from "react";

const API = "http://localhost:4000";

export default function CommanderModal({ onSelect, onClose }) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res  = await fetch(`${API}/api/external/search?q=${encodeURIComponent(query + " is:commander")}`);
      const data = await res.json();
      setResults((data.cards || []).filter(c =>
        c.type?.toLowerCase().includes("legendary") && c.type?.toLowerCase().includes("creature")
      ));
    } catch (err) { console.error(err); }
    setIsSearching(false);
  }

  return (
    <div className="modal d-block modal-open-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
        <div className="modal-content border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title text-white">
              <i className="bi bi-crown me-2 text-warning" />Choose Commander
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="input-group mb-3">
              <input type="search" className="form-control" placeholder="Search legendary creatures…"
                     value={query} onChange={e => setQuery(e.target.value)}
                     onKeyDown={e => e.key === "Enter" && search()} autoFocus />
              <button className="btn btn-outline-info" onClick={search} disabled={isSearching}>
                {isSearching ? <span className="spinner-border spinner-border-sm" /> : "Search"}
              </button>
            </div>

            <div className="d-flex flex-column gap-2">
              {results.length === 0 && query && !isSearching && (
                <p className="text-muted fst-italic text-center py-3">No commanders found.</p>
              )}
              {results.map(card => (
                <div key={card.scryfallId}
                     className="d-flex align-items-center gap-3 p-2 rounded border border-secondary card-hover"
                     style={{ background: "rgba(111,66,193,0.1)" }}
                     onClick={() => onSelect(card)}>
                  {card.image && (
                    <img src={card.image} alt={card.name}
                         style={{ width: 44, height: 60, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                  )}
                  <div className="min-w-0">
                    <p className="fw-semibold mb-0 text-info small">{card.name}</p>
                    <p className="text-muted fst-italic mb-0" style={{ fontSize: "0.75rem" }}>{card.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}