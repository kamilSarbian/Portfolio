export default function ResultBox({ result, error }) {
  if (error) return <div className="result bad">{error}</div>;
  if (!result) return null;

  const found = Boolean(result.found);
  const count = Number(result.count || 0);

  if (found) {
    return (
      <div className="result warn">
        Found in known breaches: <strong>{count.toLocaleString("en-US")}</strong> times.
      </div>
    );
  }

  return <div className="result ok">Not found in known breaches.</div>;
}
