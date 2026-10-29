import { useCatalog } from "../context/CatalogContext";

/** Tells the developer how to switch on real posters and live recommendations. */
export default function ApiNotice() {
  const { enabled } = useCatalog();
  if (enabled) return null;

  return (
    <aside className="notice">
      <strong>Live recommendations and real posters are off.</strong> Add a free TMDB API key to a{" "}
      <code>.env</code> file as <code>VITE_TMDB_API_KEY</code>, then restart the dev server. The README has the
      steps.
    </aside>
  );
}
