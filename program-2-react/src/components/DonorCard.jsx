// Reusable presentational component - receives data through props
export default function DonorCard({ donor, onRemove }) {
  return (
    <article className="donor">
      <span className="bg">{donor.bloodGroup}</span>
      <h4>{donor.name}</h4>
      <p>{donor.city} • Age {donor.age}</p>
      <p>Phone: {donor.phone}</p>
      <button onClick={() => onRemove(donor.id)}>Remove</button>
    </article>
  );
}
