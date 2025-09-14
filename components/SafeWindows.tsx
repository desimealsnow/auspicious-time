import type { WindowISO } from "@/lib/types";

export default function SafeWindows({
  list,
}: {
  list: WindowISO[] | undefined;
}) {
  if (!list?.length) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <span className="text-lg">⏰</span>
          <span>Recommended Time Windows</span>
        </div>
        <button className="text-sm px-3 py-1.5 rounded border hover:bg-slate-50 text-slate-600">
          Find next best slot
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.slice(0, 3).map((w, i) => (
          <span
            key={i}
            className="px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-slate-50 transition-colors"
          >
            {new Date(w.start).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" – "}
            {new Date(w.end).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ))}
        {list.length > 3 && (
          <span className="px-3 py-1.5 rounded-full border text-sm bg-slate-100 text-slate-500">
            +{list.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}
