export function ErrorDisplay({ error }) {
  if (!error) return null;

  return (
    <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
      <p>{error}</p>
    </div>
  );
}