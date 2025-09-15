import { ApiResp } from "@/lib/types";

export default function VerdictStrip({ r }: { r: ApiResp }) {
  // Use enhanced activity analysis if available, fallback to legacy verdict
  const activity = r?.activity;
  const verdict = r?.verdict;

  if (!activity && !verdict) return null;

  const recommendation = activity?.recommendation || verdict?.status;
  const score = activity?.score || verdict?.score || 0;
  const interpretation =
    activity?.interpretation || "This is an auspicious time for your activity";

  const tone =
    recommendation === "EXCELLENT" || recommendation === "Proceed"
      ? "bg-good"
      : recommendation === "GOOD" || recommendation === "Proceed with caution"
      ? "bg-warn"
      : recommendation === "NEUTRAL"
      ? "bg-neutral"
      : "bg-bad";

  const label =
    recommendation === "EXCELLENT"
      ? "Excellent"
      : recommendation === "GOOD" || recommendation === "Proceed"
      ? "Good"
      : recommendation === "NEUTRAL" ||
        recommendation === "Proceed with caution"
      ? "Neutral"
      : recommendation === "CHALLENGING"
      ? "Challenging"
      : "Avoid";

  const icon =
    recommendation === "EXCELLENT"
      ? "🌟"
      : recommendation === "GOOD" || recommendation === "Proceed"
      ? "✨"
      : recommendation === "NEUTRAL" ||
        recommendation === "Proceed with caution"
      ? "⚡"
      : recommendation === "CHALLENGING"
      ? "⚠️"
      : "⛔";

  return (
    <div
      className={`${tone} text-white rounded-xl px-4 py-3 flex items-center gap-3`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-semibold">{label}</span>
      <span className="opacity-90">{interpretation}</span>
      {score > 0 && (
        <span className="ml-auto text-sm opacity-75">Score: {score}/100</span>
      )}
    </div>
  );
}
