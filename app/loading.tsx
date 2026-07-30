export default function Loading() {
  return (
    <div aria-busy="true" className="route-shell route-loading-space">
      <p className="sr-only" role="status">Loading…</p>
    </div>
  );
}
