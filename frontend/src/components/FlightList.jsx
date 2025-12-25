import FlightCard from "./FlightCard";

function FlightList({ flights, route, flightClass }) {
  if (!flights.length) return null;

  return (
    <div style={{ marginTop: "20px" }}>
      {flights.map((f, i) => (
        <FlightCard key={i} flight={f} route={route} flightClass={flightClass} />
      ))}
    </div>
  );
}

export default FlightList;
