export default function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>
      <h1 className="stat-value">{value}</h1>
    </div>
  );
}
