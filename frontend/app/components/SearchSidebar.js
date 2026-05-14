"use client";

export default function SearchSidebar({
  searchQuery,
  onSearchChange,
  onSearch,
  isSearching,
  selectedColors,
  commanderColors,
  onToggleColor,
}) {
  const COLORS = ["W", "U", "B", "R", "G"];

  return (
    <aside style={panelStyle}>
      {/* Search input */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.1rem" }}>
        <input
          type="search"
          placeholder="Search cards…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          style={inputStyle}
        />
        <button onClick={onSearch} disabled={isSearching} style={btnSmStyle}>
          {isSearching ? "…" : "🔍"}
        </button>
      </div>

      {/* Color filters */}
      <label style={sectionLabelStyle}>Color Identity</label>
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {COLORS.map((color) => {
          const isActive    = selectedColors.includes(color);
          const isCommander = commanderColors.includes(color);
          const isDisabled  = commanderColors.length > 0 && !isCommander;

          return (
            <button
              key={color}
              onClick={() => onToggleColor(color)}
              disabled={isDisabled}
              style={{
                padding: "0.3rem 0.7rem",
                borderRadius: 4,
                border: `1px solid ${isActive ? "var(--gold)" : "var(--gold-dim)"}`,
                background: isActive ? "var(--elevated)" : "var(--sunken)",
                color: isActive ? "var(--gold-bright)" : "var(--text-muted)",
                fontFamily: "'Cinzel', serif",
                fontSize: "0.72rem",
                fontWeight: 600,
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.25 : 1,
                transition: "all 0.15s",
              }}
            >
              {color}
            </button>
          );
        })}
      </div>

      {commanderColors.length > 0 && (
        <p style={{ marginTop: "0.5rem", fontStyle: "italic", fontSize: "0.8rem", color: "var(--gold-mid)" }}>
          Filtering by commander's identity
        </p>
      )}
    </aside>
  );
}

const panelStyle = {
  background: "var(--surface)",
  border: "1px solid var(--gold-dim)",
  borderRadius: 8,
  padding: "1.25rem",
  position: "sticky",
  top: "5rem",
  height: "fit-content",
};

const inputStyle = {
  flex: 1,
  padding: "0.5rem 0.75rem",
  borderRadius: 4,
  border: "1px solid var(--gold-dim)",
  background: "var(--sunken)",
  color: "var(--text-primary)",
  fontFamily: "'Crimson Pro', serif",
  fontSize: "1rem",
  outline: "none",
};

const btnSmStyle = {
  padding: "0.3rem 0.75rem",
  borderRadius: 4,
  border: "1px solid var(--gold)",
  background: "var(--gold-mid)",
  color: "var(--gold-light)",
  fontFamily: "'Cinzel', serif",
  fontSize: "0.7rem",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const sectionLabelStyle = {
  display: "block",
  fontFamily: "'Cinzel', serif",
  fontSize: "0.65rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  marginBottom: "0.5rem",
};