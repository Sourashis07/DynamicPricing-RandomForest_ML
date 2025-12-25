import { useState } from "react";
import { explainPrice } from "../services/api";

function FlightCard({ flight, route, flightClass }) {
  const [open, setOpen] = useState(false);

  // Simulator controls
  const [selectedDate, setSelectedDate] = useState("");
  const [daysLeft, setDaysLeft] = useState(10);
  const [seatsLeft, setSeatsLeft] = useState(flight.seats_left);
  const [demandIndex, setDemandIndex] = useState(1.0);

  // Explanation response
  const [explain, setExplain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to calculate days from selected date
  function calculateDaysLeft(dateStr) {
    if (!dateStr) return 10; // default
    const selectedDate = new Date(dateStr);
    const today = new Date();
    const diffTime = selectedDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 1);
  }

  // Helper function to convert time to time bucket
  function getTimeBucket(timeStr) {
    const hour = parseInt(timeStr.split(':')[0]);
    if (hour < 6) return "Early_Morning";
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
  }

  async function recalc() {
    if (!route) {
      setError("Route information not available");
      return;
    }

    setLoading(true);
    setError(null);

    const finalDaysLeft = selectedDate ? calculateDaysLeft(selectedDate) : daysLeft;

    const payload = {
      airline: flight.airline,
      route: route,
      departure_time: getTimeBucket(flight.departure_time),
      arrival_time: getTimeBucket(flight.arrival_time),
      class_: flightClass || "Economy",
      days_left: finalDaysLeft,
      duration: 2.1,
      stops: 0,
      seats_left: seatsLeft,
      demand_index: demandIndex
    };
    console.log("Explain payload:", payload);

    try {
      const res = await explainPrice(payload);
      console.log("Explain API response:", res);

      if (res.error) {
        setError(res.error);
        setExplain(null);
      } else {
        setExplain(res);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to recalculate price");
      setExplain(null);
    }

    setLoading(false);
  }

  return (
    <div className="card">
      {/* ===== Flight Summary Row ===== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer"
        }}
        onClick={() => setOpen(!open)}
      >
        <div>
          <strong>{flight.airline}</strong>
          <div>{flight.departure_time} → {flight.arrival_time}</div>
          <div style={{ fontSize: "13px", color: "#666" }}>
            Seats left: {flight.seats_left}
          </div>
        </div>

        <div style={{ fontSize: "20px", fontWeight: "600" }}>
          ₹{flight.price}
        </div>
      </div>

      {/* ===== Expandable Simulator Panel ===== */}
      {open && (
        <div
          style={{
            marginTop: "20px",
            borderTop: "1px solid #eee",
            paddingTop: "15px"
          }}
        >
          {/* Date and Sliders */}
          <div style={{ display: "grid", gap: "12px" }}>
            <label>
              Travel Date:
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ marginLeft: "8px", padding: "4px" }}
              />
            </label>

            <label>
              Days to departure: <strong>{selectedDate ? calculateDaysLeft(selectedDate) : daysLeft}</strong>
              {!selectedDate && (
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={daysLeft}
                  onChange={(e) => setDaysLeft(Number(e.target.value))}
                />
              )}
            </label>

            <label>
              Seats left: <strong>{seatsLeft}</strong>
              <input
                type="range"
                min="1"
                max="150"
                value={seatsLeft}
                onChange={(e) => setSeatsLeft(Number(e.target.value))}
              />
            </label>

            <label>
              Demand index: <strong>{demandIndex}</strong>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={demandIndex}
                onChange={(e) => setDemandIndex(Number(e.target.value))}
              />
            </label>
          </div>

          <button
            style={{ 
              marginTop: "12px",
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1
            }}
            onClick={recalc}
            disabled={loading}
          >
            {loading ? "Calculating..." : "Recalculate"}
          </button>

          {/* Error */}
          {error && (
            <div style={{ marginTop: "10px", color: "red" }}>
              {error}
            </div>
          )}

          {/* Explanation Panel */}
          {explain && (
            <div
              style={{
                marginTop: "15px",
                background: "#f9fafb",
                padding: "12px",
                borderRadius: "8px"
              }}
            >
              <div>Base Fare: ₹{explain.base_fare}</div>
              <div>ML Multiplier: {explain.ml_multiplier}</div>
              <div>Seat Factor: {explain.seat_factor}</div>
              <div>Demand Factor: {explain.demand_factor}</div>

              <hr />

              <strong>Final Price: ₹{explain.final_price}</strong>

              {Array.isArray(explain.explanation) && (
                <ul style={{ marginTop: "10px" }}>
                  {explain.explanation.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FlightCard;
