import type { WindowISO } from "@/lib/types";

const C = { abh: "#06b6d4", rah: "#ef4444", yam: "#f59e0b", gul: "#f97316" };

function pct(iso: string, dayStart: number, dayEnd: number) {
  const t = new Date(iso).getTime();
  return Math.max(
    0,
    Math.min(100, ((t - dayStart) / (dayEnd - dayStart)) * 100)
  );
}

type Props = {
  sunrise?: string | null;
  sunset?: string | null;
  windows: { label: string; color: string; list: WindowISO[] }[];
};

export default function TimelineBar({ sunrise, sunset, windows }: Props) {
  if (!sunrise || !sunset) return null;

  const s = new Date(sunrise).getTime();
  const e = new Date(sunset).getTime();

  const timeLabels = [
    { time: "6:00", pos: 0 },
    { time: "9:00", pos: 25 },
    { time: "12:00", pos: 50 },
    { time: "15:00", pos: 75 },
    { time: "18:00", pos: 100 },
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 font-medium text-slate-700 mb-3">
        <span className="text-lg">📊</span>
        <span>Day Timeline</span>
        <span className="text-xs text-slate-500 ml-auto">
          Cosmic periods of the day
        </span>
      </div>

      <div className="relative">
        {/* Time labels */}
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          {timeLabels.map(({ time }) => (
            <span key={time}>{time}</span>
          ))}
        </div>

        {/* Timeline bar */}
        <div className="relative h-10 rounded-md bg-slate-100 overflow-hidden">
          {windows.flatMap((w) =>
            w.list.map((win, i) => {
              const L = pct(win.start, s, e);
              const R = pct(win.end, s, e);
              return (
                <div
                  key={w.label + i}
                  className="absolute top-0 h-full"
                  style={{
                    left: `${L}%`,
                    width: `${Math.max(1, R - L)}%`,
                    background: w.color,
                    opacity: 0.85,
                  }}
                  title={`${w.label}: ${new Date(
                    win.start
                  ).toLocaleTimeString()} – ${new Date(
                    win.end
                  ).toLocaleTimeString()}`}
                />
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 flex gap-4 text-xs text-slate-500 justify-center">
          <Legend c={C.abh} t="Abhijit" />
          <Legend c={C.rah} t="Rahu" />
          <Legend c={C.yam} t="Yamaganda" />
          <Legend c={C.gul} t="Gulika" />
        </div>
      </div>
    </div>
  );
}

const Legend = ({ c, t }: { c: string; t: string }) => (
  <span className="inline-flex items-center gap-2">
    <i className="h-2 w-6 rounded" style={{ background: c }} />
    {t}
  </span>
);
