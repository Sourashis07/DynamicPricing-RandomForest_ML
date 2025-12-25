import { useState } from "react";
import SearchBar from "./components/SearchBar";
import FlightList from "./components/FlightList";
import { searchFlights } from "./services/api";
import "./index.css";

function App() {
  const [search, setSearch] = useState({
    source: "",
    destination: "",
    flight_class: ""
  });

  const [flights, setFlights] = useState([]);
  const [route, setRoute] = useState("");

  async function handleSearch() {
    if (!search.source || !search.destination || !search.flight_class) return;

    const res = await searchFlights(search);
    setFlights(res.flights);
    setRoute(res.route);
  }

  return (
    <div className="container">
      <h1>✈ Flight Pricing Simulator</h1>
      <SearchBar
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
      />
      <FlightList flights={flights} route={route} flightClass={search.flight_class} />
    </div>
  );
}

export default App;
