export function InfoCard({
  title,
  value,
  sub,
  status,
}: {
  title: string;
  value: string;
  sub?: string;
  status?: "good" | "neutral" | "bad";
}) {
  const getStatusIcon = () => {
    switch (status) {
      case "good":
        return "✨";
      case "neutral":
        return "⚖️";
      case "bad":
        return "⚠️";
      default:
        return "★";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "good":
        return "text-good";
      case "neutral":
        return "text-warn";
      case "bad":
        return "text-bad";
      default:
        return "text-brand";
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-slate-700 font-medium mb-2">
        <span className={getStatusColor()}>{getStatusIcon()}</span>
        {title}
      </div>
      <div className="text-xl mt-1">{value}</div>
      {sub && <div className="text-sm text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}
