"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import SearchSidebar from "../components/SearchSidebar";
import CardGrid from "../components/CardGrid";
import DeckPanel from "../components/DeckPanel";
import CommanderModal from "../components/CommanderModal";
import DeckSelectorModal from "../components/DeckSelectorModal";
import RecommendationsModal from "../components/RecommendationsModal";

const API = "http://localhost:4000";

// ai
export default function DeckPage() {
  const router   = useRouter();
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;

  const [allDecks, setAllDecks]               = useState([]);
  const [currentDeck, setCurrentDeck]         = useState(null);
  const [deckCards, setDeckCards]             = useState([]);
  const [searchQuery, setSearchQuery]         = useState("");
  const [searchResults, setSearchResults]     = useState([]);
  const [isSearching, setIsSearching]         = useState(false);
  const [selectedColors, setSelectedColors]   = useState([]);
  const [commanderColors, setCommanderColors] = useState([]);
  const [hoveredCard, setHoveredCard]         = useState(null);
  const [commanderImage, setCommanderImage]   = useState(null);
  const [flash, setFlash]                     = useState(null);
  const [showNewDeckInput, setShowNewDeckInput] = useState(false);
  const [newDeckName, setNewDeckName]         = useState("");

  const [showDeckSelector, setShowDeckSelector]   = useState(false);
  const [showCommander, setShowCommander]         = useState(false);
  const [showRecs, setShowRecs]                   = useState(false);
  const [recommendations, setRecommendations]     = useState(null);
  const [isLoadingRecs, setIsLoadingRecs]         = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("username")) router.push("/login");
  }, [router]);

  useEffect(() => { loadDecks(); }, []);

  function showFlash(msg, type = "success") {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 3000);
  }

  // ai
  async function loadDecks() {
    try {
      const res  = await fetch(`${API}/api/decks?username=${encodeURIComponent(username || "")}`);
      const data = await res.json();
      setAllDecks(data.decks || []);
      if (data.decks?.length > 0 && !currentDeck) await selectDeck(data.decks[0]);
      return data.decks || [];
    } catch (err) { showFlash(err.message, "danger"); return []; }
  }

  async function selectDeck(deckItem) {
    try {
      const res  = await fetch(`${API}/api/decks/${deckItem._id}`);
      const data = await res.json();
      setCurrentDeck(data.deck);
      setDeckCards(data.deck.cards || []);
      setShowDeckSelector(false);
      if (data.deck.commander) await loadCommanderColors(data.deck.commander);
      else { setCommanderColors([]); setSelectedColors([]); }
    } catch (err) { showFlash(err.message, "danger"); }
  }

  async function loadCommanderColors(commanderName) {
    try {
      const res  = await fetch(`${API}/api/external/search?q=${encodeURIComponent(commanderName)}`);
      const data = await res.json();
      if (data.cards?.length > 0) {
        const colors = data.cards[0].colors || [];
        setCommanderColors(colors); setSelectedColors([...colors]);
        setCommanderImage(data.cards[0].image || null);
      }
    } catch (_) {}
  }

  async function createDeck() {
    if (!newDeckName.trim()) return showFlash("Enter a deck name.", "danger");
    try {
      const res  = await fetch(`${API}/api/decks`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeckName.trim(), format: "Commander", username }),
      });
      const data = await res.json();
      setNewDeckName(""); setShowNewDeckInput(false);
      await loadDecks();
      await selectDeck(data.deck);
      showFlash("Deck created!");
    } catch (err) { showFlash(err.message, "danger"); }
  }

  async function deleteDeck(deck) {
    if (!confirm(`Delete "${deck.name}"?`)) return;
    try {
      await fetch(`${API}/api/decks/${deck._id}`, { method: "DELETE" });
      const decks = await loadDecks();
      if (currentDeck?._id === deck._id) { setCurrentDeck(null); setDeckCards([]); }
    } catch (err) { showFlash(err.message, "danger"); }
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

  function toggleColor(color) {
    if (commanderColors.length > 0 && !commanderColors.includes(color))
      return showFlash(`${color} is outside your commander's color identity`, "danger");
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  }

  // ai
  const filteredCards = useMemo(() => {
    let cards = searchResults;
    if (commanderColors.length > 0)
      cards = cards.filter(c => !c.colors?.length || c.colors.every(x => commanderColors.includes(x)));
    else if (selectedColors.length > 0)
      cards = cards.filter(c => !c.colors?.length || c.colors.every(x => selectedColors.includes(x)));
    return cards;
  }, [searchResults, commanderColors, selectedColors]);

  async function addCard(card) {
    if (!currentDeck) return showFlash("Select a deck first.", "danger");
    try {
      const res  = await fetch(`${API}/api/decks/${currentDeck._id}/cards`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardName: card.name, quantity: 1 }),
      });
      const data = await res.json();
      setDeckCards(data.deck.cards || []);
      showFlash(`Added ${card.name}`);
    } catch (err) { showFlash(err.message, "danger"); }
  }

  async function updateQty(card, qty) {
    try {
      const res  = await fetch(`${API}/api/decks/${currentDeck._id}/cards/${card._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty }),
      });
      const data = await res.json();
      setDeckCards(data.deck.cards || []);
    } catch (err) { showFlash(err.message, "danger"); }
  }

  async function removeCard(card) {
    try {
      const res  = await fetch(`${API}/api/decks/${currentDeck._id}/cards/${card._id}`, { method: "DELETE" });
      const data = await res.json();
      setDeckCards(data.deck.cards || []);
      showFlash(`Removed ${card.card_name}`);
    } catch (err) { showFlash(err.message, "danger"); }
  }

  async function clearDeck() {
    if (!currentDeck || !confirm("Remove all cards?")) return;
    for (const card of [...deckCards])
      await fetch(`${API}/api/decks/${currentDeck._id}/cards/${card._id}`, { method: "DELETE" });
    setDeckCards([]);
    showFlash("Deck cleared");
  }

  async function setCommander(card) {
    if (!currentDeck) return;
    try {
      await fetch(`${API}/api/decks/${currentDeck._id}/commander`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commander: card.name }),
      });
      setCurrentDeck(prev => ({ ...prev, commander: card.name }));
      const colors = card.colors || [];
      setCommanderColors(colors); setSelectedColors([...colors]);
      setCommanderImage(card.image || null);
      setShowCommander(false);
      showFlash(`${card.name} set as commander`);
    } catch (err) { showFlash(err.message, "danger"); }
  }

  async function removeCommander() {
    if (!currentDeck || !confirm("Remove commander?")) return;
    try {
      await fetch(`${API}/api/decks/${currentDeck._id}/commander`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commander: null }),
      });
      setCurrentDeck(prev => ({ ...prev, commander: null }));
      setCommanderColors([]); setSelectedColors([]);
      setCommanderImage(null);
      showFlash("Commander removed");
    } catch (err) { showFlash(err.message, "danger"); }
  }

  async function loadRecs() {
    if (!currentDeck) return showFlash("Select a deck first.", "danger");
    if (!currentDeck.commander) return showFlash("Set a commander for recommendations.", "danger");
    setIsLoadingRecs(true); setShowRecs(true);
    try {
      const res  = await fetch(`${API}/api/external/recommendations/${encodeURIComponent(currentDeck.commander)}`);
      const data = await res.json();
      setRecommendations(data.recommendations);
    } catch (err) { showFlash(err.message, "danger"); }
    finally { setIsLoadingRecs(false); }
  }

  async function addRecommended(cardName) {
    if (!currentDeck) return;
    try {
      const res  = await fetch(`${API}/api/decks/${currentDeck._id}/cards`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardName, quantity: 1 }),
      });
      const data = await res.json();
      setDeckCards(data.deck.cards || []);
      showFlash(`Added ${cardName}`);
    } catch (err) { showFlash(err.message, "danger"); }
  }

  const deckCount = deckCards.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="min-vh-100" style={{ background: "radial-gradient(ellipse at top, #1a0533 0%, #0d0117 60%)" }}>
      {/* Navbar */}
      <nav className="navbar navbar-dark sticky-top border-bottom border-secondary"
           style={{ background: "rgba(26,5,51,0.95)", backdropFilter: "blur(8px)" }}>
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">
            <i className="bi bi-stack me-2 text-info" />BinderBase
          </span>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button className="btn btn-sm btn-outline-warning" onClick={loadRecs}>
              <i className="bi bi-lightbulb me-1" />Suggestions
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowDeckSelector(true)}>
              <i className="bi bi-collection me-1" />
              {currentDeck ? currentDeck.name : "Select Deck"}
            </button>
            {showNewDeckInput ? (
              <div className="d-flex gap-1">
                <input type="text" className="form-control form-control-sm" placeholder="Deck name…"
                       value={newDeckName} onChange={e => setNewDeckName(e.target.value)}
                       onKeyDown={e => e.key === "Enter" && createDeck()} autoFocus style={{ width: 160 }} />
                <button className="btn btn-sm btn-primary" onClick={createDeck}>Create</button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowNewDeckInput(false)}>✕</button>
              </div>
            ) : (
              <button className="btn btn-sm btn-primary" onClick={() => setShowNewDeckInput(true)}>
                <i className="bi bi-plus-lg me-1" />New Deck
              </button>
            )}
            <button className="btn btn-sm btn-outline-info" onClick={() => router.push("/library")}>
              <i className="bi bi-book me-1" />Library
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
        <div className={`alert alert-${flash.type === "danger" ? "danger" : "success"} alert-dismissible mx-3 mt-3 py-2`}>
          {flash.msg}
        </div>
      )}

      {/* Main layout */}
      <div className="container-fluid p-3">
        <div className="row g-3" style={{ gridTemplateColumns: "250px 1fr 300px" }}>
          {/* Sidebar */}
          <div className="col-12 col-lg-2">
            <SearchSidebar
              searchQuery={searchQuery} onSearchChange={setSearchQuery}
              onSearch={performSearch} isSearching={isSearching}
              selectedColors={selectedColors} commanderColors={commanderColors}
              onToggleColor={toggleColor}
            />
          </div>

          {/* Card grid */}
          <div className="col-12 col-lg-7">
            <div className="card border-secondary">
              <div className="card-header d-flex justify-content-between align-items-center border-secondary">
                <span className="section-label mb-0">Search Results</span>
                <span className="badge bg-secondary">{filteredCards.length} cards</span>
              </div>
              <div className="card-body">
                <CardGrid
                  cards={filteredCards} onAddCard={addCard}
                  onHover={setHoveredCard} searchQuery={searchQuery}
                />
              </div>
            </div>
          </div>

          {/* Deck panel */}
          <div className="col-12 col-lg-3">
            <DeckPanel
              deck={currentDeck} cards={deckCards} deckCount={deckCount}
              commanderImage={commanderImage}
              onSetCommander={() => setShowCommander(true)}
              onRemoveCommander={removeCommander}
              onUpdateQty={updateQty} onRemoveCard={removeCard}
              onClear={clearDeck} onHoverCard={setHoveredCard}
            />
          </div>
        </div>
      </div>

      {/* Card preview */}
      {hoveredCard && (hoveredCard.card_image || hoveredCard.image) && (
        <div style={{ position: "fixed", right: "2rem", top: "50%", transform: "translateY(-50%)",
                      pointerEvents: "none", zIndex: 9000 }}>
          <img src={hoveredCard.card_image || hoveredCard.image}
               alt={hoveredCard.card_name || hoveredCard.name}
               style={{ width: 230, borderRadius: 8, border: "1px solid #6f42c1",
                        boxShadow: "0 0 30px rgba(111,66,193,0.6)" }} />
        </div>
      )}

      {showDeckSelector && <DeckSelectorModal decks={allDecks} currentDeckId={currentDeck?._id}
        onSelect={selectDeck} onDelete={deleteDeck} onClose={() => setShowDeckSelector(false)} />}
      {showCommander && <CommanderModal onSelect={setCommander} onClose={() => setShowCommander(false)} />}
      {showRecs && <RecommendationsModal recommendations={recommendations} isLoading={isLoadingRecs}
        onAddCard={addRecommended} onClose={() => setShowRecs(false)} />}
    </div>
  );
}