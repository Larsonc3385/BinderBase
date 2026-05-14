"use client";

export default function SearchSidebar({
  searchQuery, onSearchChange, onSearch, isSearching,
  selectedColors, commanderColors, onToggleColor,
}) {
  const COLORS = ["W", "U", "B", "R", "G"];

  return (
    <div className="card border-secondary sidebar-sticky">
      <div className="card-body">
        {/* Search */}
        <div className="input-group mb-3">
          <input
            type="search"
            className="form-control"
            placeholder="Search cards…"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSearch()}
          />
          <button className="btn btn-outline-info" onClick={onSearch} disabled={isSearching}>
            {isSearching ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-search" />}
          </button>
        </div>

        {/* Color identity */}
        <p className="section-label mb-2">Color Identity</p>
        <div className="d-flex gap-2 flex-wrap">
          {COLORS.map(color => {
            const isActive    = selectedColors.includes(color);
            const isCommander = commanderColors.includes(color);
            const isDisabled  = commanderColors.length > 0 && !isCommander;
            return (
              <button
                key={color}
                onClick={() => onToggleColor(color)}
                disabled={isDisabled}
                className={`btn btn-sm ${isActive ? "btn-primary" : "btn-outline-secondary"}`}
                style={{ minWidth: 36, opacity: isDisabled ? 0.3 : 1 }}
              >
                {color}
              </button>
            );
          })}
        </div>
        {commanderColors.length > 0 && (
          <p className="text-muted small fst-italic mt-2 mb-0">
            Filtering by commander's identity
          </p>
        )}
      </div>
    </div>
  );
}