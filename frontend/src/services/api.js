const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function predictPrice(payload) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function simulateSeats(payload) {
  const res = await fetch(`${API_BASE}/simulate/seats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function simulateDemand(payload) {
  const res = await fetch(`${API_BASE}/simulate/demand`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function searchFlights(payload) {
  const res = await fetch("http://localhost:8000/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}
export async function explainPrice(payload) {
  const res = await fetch("http://localhost:8000/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}
