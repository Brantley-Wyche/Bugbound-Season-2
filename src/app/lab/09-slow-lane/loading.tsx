export default function TripDeskLoading() {
  return (
    <div>
      <span className="lv-tag">Trip Desk</span>
      <div className="lv-grid" style={{ marginTop: 14 }}>
        <div className="lv-skeleton">Checking flights…</div>
        <div className="lv-skeleton">Comparing hotels…</div>
        <div className="lv-skeleton">Reading the sky…</div>
      </div>
    </div>
  );
}
