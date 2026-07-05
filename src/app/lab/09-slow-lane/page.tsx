import { getFlights, getHotels, getWeather } from './data';

export default async function TripDeskPage() {
  const flights = await getFlights();
  const hotels = await getHotels();
  const weather = await getWeather();

  return (
    <div>
      <span className="lv-tag">Trip Desk</span>
      <h1 className="lv-heading" data-testid="trip-title" style={{ margin: '10px 0 14px' }}>
        Your weekend, assembled
      </h1>
      <div className="lv-grid">
        <div className="lv-card" data-testid="flights">
          <h2 className="lv-heading">Flights</h2>
          <ul className="lv-list">
            {flights.map((f) => (
              <li key={f.code}>
                <strong>{f.code}</strong> {f.route} — {f.status}
              </li>
            ))}
          </ul>
        </div>
        <div className="lv-card" data-testid="hotels">
          <h2 className="lv-heading">Hotels</h2>
          <ul className="lv-list">
            {hotels.map((hotel) => (
              <li key={hotel.name}>
                {hotel.name} · {hotel.district} · ${hotel.nightly}/night
              </li>
            ))}
          </ul>
        </div>
        <div className="lv-card" data-testid="weather">
          <h2 className="lv-heading">Weather</h2>
          <p className="lv-muted">{weather.summary}</p>
          <span className="lv-stat">
            {weather.highC}° / {weather.lowC}°
          </span>
        </div>
      </div>
    </div>
  );
}
