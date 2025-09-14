import { ApiResp } from "@/lib/types";
import { fmtTime } from "@/lib/fmt";

export default function PanchangCard({ r }: { r: ApiResp }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 font-medium text-slate-700 mb-3">
        <span className="text-lg">📅</span>
        <span>Panchang Details</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Row
            icon="🌅"
            label="Sunrise"
            value={fmtTime(r.sunrise)}
            color="text-orange-500"
          />
          <Row
            icon="🌇"
            label="Sunset"
            value={fmtTime(r.sunset)}
            color="text-orange-600"
          />
        </div>
        <div className="space-y-2">
          <Row
            icon="🌙"
            label="Tithi"
            value={r.tithi?.name ? `${r.tithi.name} (${r.tithi.index})` : "—"}
            color="text-blue-500"
          />
          <Row
            icon="⭐"
            label="Nakshatra"
            value={
              r.nakshatra?.name
                ? `${r.nakshatra.name} (${r.nakshatra.index})`
                : "—"
            }
            color="text-purple-500"
          />
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
      <span className="flex items-center gap-2 text-slate-600">
        <span className={color}>{icon}</span>
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
