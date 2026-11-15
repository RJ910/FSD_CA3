import DonorCard from "./DonorCard.jsx";

export default function DonorList({ donors, groups, query, onQuery, group, onGroup, onRemove }) {
  return (
    <section>
      <p className="eyebrow">BLOOD DONOR REGISTRY</p>
      <h2>Find a donor. Save a life.</h2>
      <div className="controls">
        <input
          placeholder="Search by name or city"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
        {groups.map((g) => (
          <button
            key={g}
            className={g === group ? "chip active" : "chip"}
            onClick={() => onGroup(g)}
          >
            {g}
          </button>
        ))}
      </div>
      {donors.length === 0 ? (
        <p className="status">No donors match your search.</p>
      ) : (
        <div className="grid">
          {donors.map((d) => (
            <DonorCard key={d.id} donor={d} onRemove={onRemove} />
          ))}
        </div>
      )}
    </section>
  );
}
