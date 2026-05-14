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

export default function DeckPage() {
  const router = useRouter();
  const username =
    typeof window !== "undefined" ? localStorage.getItem("username") : null;

  // ── State ──────────────────────────────────────────────────────────────────
  const [allDecks, setAllDecks]             = useState([]);
  const [currentDeck, setCurrentDeck]       = useState(null);
  const [deckCards, setDeckCards]           = useState([]);
  const [searchQuery, setSearchQuery]       = useState("");
  const [searchResults, setSearchResults]   = useState([]);
  const [isSearching, setIsSearching]       = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [commanderColors, setCommanderColors] = useState([]);
  const [hoveredCard, setHoveredCard]       = useState(null);
  const [error, setError]                   = useState(null);
  const [success, setSuccess]               = useState(null);
  const [showNewDeckInput, setShowNewDeckInput] = useState(false);
  const [newDeckName, setNewDeckName]       = useState("");

  // Modals
  const [showDeckSelector, setShowDeckSelector]   = useState(false);
  const [showCommander, setShowCommander]         = useState(false);
  const [showRecs, setShowRecs]                   = useState(false);
  const [recommendations, setRecommendations]     = useState(null);
  const [isLoadingRecs, setIsLoadingRecs]         = useState(false);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem("username")) router.push("/login");
  }, [router]);

  // ── Load decks on mount ────────────────────────────────────────────────────
  useEffect(() => {
    loadDecks();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function flash(msg, type = "success") {
    if (type === "success") setSuccess(msg);
    else setError(msg);
    setTimeout(() => { setSuccess(null); setError(null); }, 3000);
  }

  // ── Decks ──────────────────────────────────────────────────────────────────
  async function loadDecks() {
    try {
      const res = await fetch(
        `${API}/api/decks?username=${encodeURIComponent(username || "")}`
      );
      const data = await res.json();
      setAllDecks(data.decks || []);
      if (data.decks?.length > 0 && !currentDeck) {
        await selectDeck(data.decks[0]);
      }
      return data.decks || [];
    } catch (err) {
      flash(err.message, "error");
      return [];
    }
  }

  async function selectDeck(deckItem) {
    try {
      const res = await fetch(`${API}/api/decks/${deckItem._id}`);
      const data = await res.json();
      setCurrentDeck(data.deck);
      setDeckCards(data.deck.cards || []);
      setShowDeckSelector(false);

      if (data.deck.commander) {
        await loadCommanderColors(data.deck.commander);
      } else {
        setCommanderColors([]);
        setSelectedColors([]);
      }
    } catch (err) {
      flash(err.message, "error");
    }
  }

  async function loadCommanderColors(commanderName) {
    try {
      const res = await fetch(
        `${API}/api/external/search?q=${encodeURIComponent(commanderName)}`
      );
      const data = await res.json();
      if (data.cards?.length > 0) {
        const colors = data.cards[0].colors || [];
        setCommanderColors(colors);
        setSelectedColors([...colors]);
      }
    } catch (_) {}
  }

  async function createDeck() {
    if (!newDeckName.trim()) return flash("Enter a deck name.", "error");
    try {
      const res = await fetch(`${API}/api/decks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeckName.trim(), format: "Commander", username }),
      });
      const data = await res.json();
      setNewDeckName("");
      setShowNewDeckInput(false);
      const decks = await loadDecks();
      await selectDeck(data.deck);
      flash("Deck created!");
    } catch (err) {
      flash(err.message, "error");
    }
  }

  async function deleteDeck(deck) {
    if (!confirm(`Delete "${deck.name}"?`)) return;
    try {
      await fetch(`${API}/api/decks/${deck._id}`, { method: "DELETE" });
      const decks = await loadDecks();
      if (currentDeck?._id === deck._id) {
        setCurrentDeck(null);
        setDeckCards([]);
      }
    } catch (err) {
      flash(err.message, "error");
    }
  }

  // ── Card search ────────────────────────────────────────────────────────────
  async function performSearch() {
    if (!searchQuery.trim()) return setSearchResults([]);
    setIsSearching(true);
    try {
      const res = await fetch(
        `${API}/api/external/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      setSearchResults(data.cards || []);
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setIsSearching(false);
    }
  }

  // ── Color filter ───────────────────────────────────────────────────────────
  function toggleColor(color) {
    if (commanderColors.length > 0 && !commanderColors.includes(color)) {
      return flash(`${color} is outside your commander's color identity`, "error");
    }
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  }

  const filteredCards = useMemo(() => {
    let cards = searchResults;
    if (commanderColors.length > 0) {
      cards = cards.filter(
        (c) => !c.colors?.length || c.colors.every((x) => commanderColors.includes(x))
      );
    } else if (selectedColors.length > 0) {
      cards = cards.filter(
        (c) => !c.colors?.length || c.colors.every((x) => selectedColors.includes(x))
      );
    }
    return cards;
  }, [searchResults, commanderColors, selectedColors]);

  // ── Add / update / remove cards ────────────────────────────────────────────
  async function addCard(card) {
    if (!currentDeck) return flash("Select a deck first.", "error");
    try {
      const res = await fetch(`${API}/api/decks/${currentDeck._id}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardName: card.name, quantity: 1 }),
      });
      const data = await res.json();
      setDeckCards(data.deck.cards || []);
      flash(`Added ${card.name}`);
    } catch (err) {
      flash(err.message, "error");
    }
  }

  async function updateQty(card, qty) {
    try {
      const res = await fetch(
        `${API}/api/decks/${currentDeck._id}/cards/${card._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: qty }),
        }
      );
      const data = await res.json();
      setDeckCards(data.deck.cards || []);
    } catch (err) {
      flash(err.message, "error");
    }
  }

  async function removeCard(card) {
    try {
      const res = await fetch(
        `${API}/api/decks/${currentDeck._id}/cards/${card._id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      setDeckCards(data.deck.cards || []);
      flash(`Removed ${card.card_name}`);
    } catch (err) {
      flash(err.message, "error");
    }
  }

  async function clearDeck() {
    if (!currentDeck || !confirm("Remove all cards from this deck?")) return;
    for (const card of [...deckCards]) {
      await fetch(`${API}/api/decks/${currentDeck._id}/cards/${card._id}`, {
        method: "DELETE",
      });
    }
    setDeckCards([]);
    flash("Deck cleared");
  }

  // ── Commander ──────────────────────────────────────────────────────────────
  async function setCommander(card) {
    if (!currentDeck) return;
    try {
      await fetch(`${API}/api/decks/${currentDeck._id}/commander`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commander: card.name }),
      });
      setCurrentDeck((prev) => ({ ...prev, commander: card.name }));
      const colors = card.colors || [];
      setCommanderColors(colors);
      setSelectedColors([...colors]);
      setShowCommander(false);
      flash(`${card.name} set as commander`);
    } catch (err) {
      flash(err.message, "error");
    }
  }

  async function removeCommander() {
    if (!currentDeck || !confirm("Remove commander?")) return;
    try {
      await fetch(`${API}/api/decks/${currentDeck._id}/commander`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commander: null }),
      });
      setCurrentDeck((prev) => ({ ...prev, commander: null }));
      setCommanderColors([]);
      setSelectedColors([]);
      flash("Commander removed");
    } catch (err) {
      flash(err.message, "error");
    }
  }

  // ── Recommendations ────────────────────────────────────────────────────────
  async function loadRecs() {
    if (!currentDeck) return flash("Select a deck first.", "error");
    if (!currentDeck.commander) return flash("Set a commander for recommendations.", "error");
    setIsLoadingRecs(true);
    setShowRecs(true);
    try {
      const res = await fetch(
        `${API}/api/external/recommendations/${encodeURIComponent(currentDeck.commander)}`
      );
      const data = await res.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setIsLoadingRecs(false);
    }
  }

  async function addRecommended(cardName) {
    if (!currentDeck) return;
    try {
      const res = await fetch(`${API}/api/decks/${currentDeck._id}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardName, quantity: 1 }),
      });
      const data = await res.json();
      setDeckCards(data.deck.cards || []);
      flash(`Added ${cardName}`);
    } catch (err) {
      flash(err.message, "error");
    }
  }

  const deckCount = deckCards.reduce((s, c) => s + c.quantity, 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          background: "var(--sunken)",
          borderBottom: "1px solid var(--gold-mid)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1500,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "0.75rem 1.25rem",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 6,
                border: "1px solid var(--gold)",
                background: "var(--void)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--gold-bright)",
                flexShrink: 0,
              }}
            >
              BB
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "var(--gold-bright)",
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                BinderBase
              </h1>
              <p style={{ fontStyle: "italic", fontSize: "0.8rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                Deck builder & card browser
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <button onClick={loadRecs} style={btnGhostStyle}>💡 Suggestions</button>
            <button onClick={() => setShowDeckSelector(true)} style={{ ...btnGhostStyle, minWidth: 170, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis" }}>
              📚 {currentDeck ? currentDeck.name : "Select Deck"}
            </button>

            {showNewDeckInput ? (
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <input
                  type="text"
                  placeholder="Deck name…"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createDeck()}
                  autoFocus
                  style={{ padding: "0.4rem 0.6rem", borderRadius: 4, border: "1px solid var(--gold-mid)", background: "var(--sunken)", color: "var(--text-primary)", fontFamily: "'Crimson Pro', serif", fontSize: "0.9rem", outline: "none" }}
                />
                <button onClick={createDeck} style={btnStyle}>Create</button>
                <button onClick={() => setShowNewDeckInput(false)} style={btnGhostStyle}>✕</button>
              </div>
            ) : (
              <button onClick={() => setShowNewDeckInput(true)} style={btnStyle}>+ New Deck</button>
            )}

            <button onClick={() => router.push("/library")} style={btnGhostStyle}>
              📚 Library
            </button>
            <button
              onClick={() => { localStorage.clear(); router.push("/login"); }}
              style={btnGhostStyle}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Flash messages */}
      {(error || success) && (
        <div
          style={{
            margin: "0.75rem 1.25rem 0",
            padding: "0.5rem 0.85rem",
            borderRadius: 4,
            fontSize: "0.95rem",
            border: error ? "1px solid rgba(127,29,29,0.5)" : "1px solid rgba(20,83,45,0.5)",
            background: error ? "rgba(127,29,29,0.2)" : "rgba(20,83,45,0.2)",
            color: error ? "#f87171" : "#6ee7b7",
          }}
        >
          {error || success}
        </div>
      )}

      {/* Main 3-column grid */}
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "250px 1fr 310px",
          gap: "1rem",
          padding: "1rem 1.25rem",
        }}
      >
        {/* Sidebar */}
        <SearchSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={performSearch}
          isSearching={isSearching}
          selectedColors={selectedColors}
          commanderColors={commanderColors}
          onToggleColor={toggleColor}
        />

        {/* Card results */}
        <main
          style={{
            background: "var(--surface)",
            border: "1px solid var(--gold-dim)",
            borderRadius: 8,
            padding: "1.25rem",
            minHeight: 500,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid var(--gold-dim)",
            }}
          >
            <span style={sectionLabelStyle}>Search Results</span>
            <span style={{ fontStyle: "italic", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {filteredCards.length} cards
            </span>
          </div>
          <CardGrid
            cards={filteredCards}
            onAddCard={addCard}
            onHover={setHoveredCard}
            searchQuery={searchQuery}
          />
        </main>

        {/* Deck panel */}
        <DeckPanel
          deck={currentDeck}
          cards={deckCards}
          deckCount={deckCount}
          onSetCommander={() => setShowCommander(true)}
          onRemoveCommander={removeCommander}
          onUpdateQty={updateQty}
          onRemoveCard={removeCard}
          onClear={clearDeck}
          onHoverCard={setHoveredCard}
        />
      </div>

      {/* Card preview tooltip */}
      {hoveredCard && (hoveredCard.card_image || hoveredCard.image) && (
        <div
          style={{
            position: "fixed",
            right: "2rem",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            zIndex: 10000,
          }}
        >
          <img
            src={hoveredCard.card_image || hoveredCard.image}
            alt={hoveredCard.card_name || hoveredCard.name}
            style={{
              width: 240,
              borderRadius: 8,
              border: "1px solid var(--gold)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(139,105,20,0.25)",
            }}
          />
        </div>
      )}

      {/* Modals */}
      {showDeckSelector && (
        <DeckSelectorModal
          decks={allDecks}
          currentDeckId={currentDeck?._id}
          onSelect={selectDeck}
          onDelete={deleteDeck}
          onClose={() => setShowDeckSelector(false)}
        />
      )}
      {showCommander && (
        <CommanderModal
          onSelect={setCommander}
          onClose={() => setShowCommander(false)}
        />
      )}
      {showRecs && (
        <RecommendationsModal
          recommendations={recommendations}
          isLoading={isLoadingRecs}
          onAddCard={addRecommended}
          onClose={() => setShowRecs(false)}
        />
      )}
    </div>
  );
}

const sectionLabelStyle = {
  fontFamily: "'Cinzel', serif",
  fontSize: "0.65rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const btnStyle = {
  padding: "0.45rem 1rem",
  borderRadius: 4,
  border: "1px solid var(--gold)",
  background: "var(--gold-mid)",
  color: "var(--gold-light)",
  fontFamily: "'Cinzel', serif",
  fontSize: "0.7rem",
  fontWeight: 600,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const btnGhostStyle = {
  padding: "0.45rem 1rem",
  borderRadius: 4,
  border: "1px solid var(--gold-dim)",
  background: "transparent",
  color: "#a08850",
  fontFamily: "'Cinzel', serif",
  fontSize: "0.7rem",
  fontWeight: 600,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  cursor: "pointer",
  whiteSpace: "nowrap",
};