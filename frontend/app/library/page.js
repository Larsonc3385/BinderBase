"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CardDetailModal from "../components/CardDetailModal";

const API = "http://localhost:4000";

export default function LibraryPage() {
  const router   = useRouter();
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;

  const [library, setLibrary]             = useState([]);
  const [loadingLib, setLoadingLib]       = useState(true);
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching]     = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [flash, setFlash]                 = useState(null);
  const [importingId, setImportingId]     = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("username")) router.push("/login");
  }, [router]);

  useEffect(() => { loadLibrary(); }, []);

  function showFlash(msg, type = "success") {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 3000);
  }

  async function loadLibrary() {
    setLoadingLib(true);
    try {
      const res  = await fetch(`${API}/api/cards`);
      const data = await res.json();
      setLibrary(data.cards || []);
    } catch (err) { showFlash(err.message, "danger"); }
    finally { setLoadingLib(false); }
  }

  async function performSearch() {
    if (!searchQuery.trim()) return setSearchResults([]);
    setIsSearching(true);
    try {
      const res  = await fetch(`${API}/api/external/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.cards || []);
    } catch (err) { showFlash(err.message, "danger"); }
    finally { setIsSearching(false); }
  }

  async function importCard(card) {
    setImportingId(card.scryfallId);
    try {
      const res  = await fetch(`${API}/api/cards`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      if (data.duplicate) showFlash(`"${card.name}" is already in your library.`, "warning");
      else { showFlash(`"${card.name}" added to library!`); setLibrary(prev => [data.card, ...prev]); }
    } catch (err) { showFlash(err.message, "danger"); }
    finally { setImportingId(null); }
  }

  async function removeCard(card) {
    if (!confirm(`Remove "${card.name}" from your library?`)) return;
    try {
      await fetch(`${API}/api/cards/${card._id}`, { method: "DELETE" });
      setLibrary(prev => prev.filter(c => c._id !== card._id));
      showFlash(`"${card.name}" removed.`);
    } catch (err) { showFlash(err.message, "danger"); }
  }

  function isInLibrary(scryfallId) {
    return library.some(c => c.scryfallId === scryfallId);
  }

  return (
    <div className="min-vh-100" style={{ background: "radial-gradient(ellipse at top, #1a0533 0%, #0d0117 60%)" }}>
      {/* Navbar */}
      <nav className="navbar navbar-dark sticky-top border-bottom border-secondary"
           style={{ background: "rgba(26,5,51,0.95)", backdropFilter: "blur(8px)" }}>
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">
            <i className="bi bi-stack me-2 text-info" />BinderBase
            <span className="text-muted fw-normal ms-2 small">/ Library</span>
          </span>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-info" onClick={() => router.push("/deck")}>
              <i className="bi bi-layers me-1" />Deck Builder
            </button>
            <button className="btn btn-sm btn-outline-secondary"
                    onClick={() => { localStorage.clear(); router.push("/login"); }}>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Flash */}
      {flash && (
        <div className={`alert alert-${flash.type} alert-dismissible mx-3 mt-3 py-2`}>
          {flash.msg}
        </div>
      )}

      <div className="container-fluid p-3 d-flex flex-column gap-4">

        {/* Discover section */}
        <div className="card border-secondary">
          <div className="card-header border-secondary">
            <h5 className="mb-0 text-white">
              <i className="bi bi-search me-2 text-info" />Discover Cards
            </h5>
            <small className="text-muted">Search Scryfall and import cards into your local library</small>
          </div>
          <div className="card-body">
            <div className="input-group mb-3">
              <input type="search" className="form-control"
                     placeholder="Search Scryfall… (e.g. 'lightning bolt', 'is:commander')"
                     value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                     onKeyDown={e => e.key === "Enter" && performSearch()} />
              <button className="btn btn-outline-info" onClick={performSearch} disabled={isSearching}>
                {isSearching
                  ? <span className="spinner-border spinner-border-sm" />
                  : <><i className="bi bi-search me-1" />Search</>}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-3">
                {searchResults.map(card => {
                  const already = isInLibrary(card.scryfallId);
                  return (
                    <div key={card.scryfallId} className="col">
                      <div className="card h-100 border-secondary">
                        {card.image
                          ? <img src={card.image} alt={card.name} className="card-img-cover" />
                          : <div className="card-img-cover d-flex align-items-center justify-content-center text-muted small"
                                 style={{ background: "#1a0533" }}>No Image</div>
                        }
                        <div className="card-body p-2 d-flex flex-column gap-1">
                          <p className="card-title small fw-semibold text-truncate mb-0"
                             style={{ color: "#e2b8ff", fontSize: "0.72rem" }}>{card.name}</p>
                          <p className="text-muted fst-italic text-truncate mb-0"
                             style={{ fontSize: "0.68rem" }}>{card.type}</p>
                          <button
                            onClick={() => !already && importCard(card)}
                            disabled={already || importingId === card.scryfallId}
                            className={`btn btn-sm mt-auto ${already ? "btn-outline-secondary" : "btn-outline-primary"}`}
                            style={{ fontSize: "0.65rem" }}>
                            {already ? "✓ In Library"
                              : importingId === card.scryfallId ? "Adding…"
                              : "+ Add to Library"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {searchResults.length === 0 && searchQuery && !isSearching && (
              <p className="text-muted fst-italic">No results found.</p>
            )}
          </div>
        </div>

        {/* Local library */}
        <div className="card border-secondary">
          <div className="card-header border-secondary d-flex align-items-center justify-content-between">
            <h5 className="mb-0 text-white">
              <i className="bi bi-collection me-2 text-primary" />My Library
            </h5>
            <span className="badge bg-primary bg-opacity-50">{library.length} cards</span>
          </div>
          <div className="card-body">
            {loadingLib ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" />
              </div>
            ) : library.length === 0 ? (
              <p className="text-muted fst-italic text-center py-3">
                Your library is empty — search for cards above and import them!
              </p>
            ) : (
              <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-3">
                {library.map(card => (
                  <div key={card._id} className="col">
                    <div className="card h-100 border-secondary card-hover"
                         onClick={() => setSelectedCardId(card._id)}
                         title="Click for full details">
                      {card.image
                        ? <img src={card.image} alt={card.name} className="card-img-cover" />
                        : <div className="card-img-cover d-flex align-items-center justify-content-center text-muted small"
                               style={{ background: "#1a0533" }}>No Image</div>
                      }
                      <div className="card-body p-2 d-flex flex-column gap-1">
                        <p className="card-title small fw-semibold text-truncate mb-0"
                           style={{ color: "#e2b8ff", fontSize: "0.72rem" }}>{card.name}</p>
                        <p className="text-muted fst-italic text-truncate mb-0"
                           style={{ fontSize: "0.68rem" }}>{card.type}</p>
                        <div className="d-flex gap-1 mt-1 flex-wrap">
                          <span className={`badge ${rarityBadge(card.rarity)}`} style={{ fontSize: "0.6rem" }}>
                            {card.rarity}
                          </span>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); removeCard(card); }}
                          className="btn btn-sm btn-outline-danger mt-auto"
                          style={{ fontSize: "0.65rem" }}>
                          <i className="bi bi-trash me-1" />Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCardId && (
        <CardDetailModal cardId={selectedCardId} onClose={() => setSelectedCardId(null)} />
      )}
    </div>
  );
}

function rarityBadge(rarity) {
  const map = { common: "bg-secondary", uncommon: "bg-info text-dark",
                rare: "bg-warning text-dark", mythic: "bg-danger" };
  return map[rarity?.toLowerCase()] || "bg-secondary";
}