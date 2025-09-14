import { ApiResp } from "@/lib/types";

export default function VerdictStrip({ r }: { r: ApiResp }) {
  if (!r?.verdict) return null;

  const tone =
    r.verdict.status === "Proceed"
      ? "bg-good"
      : r.verdict.status === "Proceed with caution"
      ? "bg-warn"
      : "bg-bad";

  const label =
    r.verdict.status === "Proceed"
      ? "Good"
      : r.verdict.status === "Proceed with caution"
      ? "Caution"
      : "Avoid";

  const icon =
    r.verdict.status === "Proceed"
      ? "✨"
      : r.verdict.status === "Proceed with caution"
      ? "⚠️"
      : "⛔";

  return (
    <div
      className={`${tone} text-white rounded-xl px-4 py-3 flex items-center gap-3`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-semibold">{label}</span>
      <span className="opacity-90">
        This is an auspicious time for your activity
      </span>
    </div>
  );
}
