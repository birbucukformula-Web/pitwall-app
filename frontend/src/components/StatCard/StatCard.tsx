import "./StatCard.css";

type StatCardProps = {
  title: string;
  value: number;
  description: string;
  color: "black" | "red" | "orange" | "green";
};

export default function StatCard({
  title,
  value,
  description,
  color,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span>{title}</span>
        <span className={`stat-dot ${color}`} />
      </div>

      <strong>{value}</strong>

      <p>{description}</p>
    </div>
  );
}