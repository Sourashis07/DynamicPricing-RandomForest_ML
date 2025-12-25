import React from "react";

const AIRPORTS = [
  { code: "Delhi", label: "Delhi (DEL)" },
  { code: "Mumbai", label: "Mumbai (BOM)" },
  { code: "Bangalore", label: "Bangalore (BLR)" }
];

const FLIGHT_CLASSES = [
  { code: "Economy", label: "Economy" },
  { code: "Business", label: "Business" }
];

function SearchBar({ search, setSearch, onSearch }) {
  return (
    <div className="card">
      <h2>Search Flights</h2>

      <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
        <select
          value={search.source}
          onChange={(e) => {
            const newSource = e.target.value;
            setSearch({ 
              ...search, 
              source: newSource,
              destination: search.destination === newSource ? "" : search.destination
            });
          }}
        >
          <option value="">From</option>
          {AIRPORTS.map(a => (
            <option key={a.code} value={a.code}>{a.label}</option>
          ))}
        </select>

        <select
          value={search.destination}
          onChange={(e) =>
            setSearch({ ...search, destination: e.target.value })
          }
        >
          <option value="">To</option>
          {AIRPORTS.filter(a => a.code !== search.source).map(a => (
            <option key={a.code} value={a.code}>{a.label}</option>
          ))}
        </select>

        <select
          value={search.flight_class}
          onChange={(e) =>
            setSearch({ ...search, flight_class: e.target.value })
          }
        >
          <option value="">Class</option>
          {FLIGHT_CLASSES.map(c => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>

        <button onClick={onSearch}>Search</button>
      </div>
    </div>
  );
}

export default SearchBar;
