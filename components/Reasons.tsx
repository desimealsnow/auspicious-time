export default function Reasons({ list }: { list: string[] | undefined }) {
  if (!list?.length) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 font-medium text-slate-700 mb-3">
        <span className="text-lg">💡</span>
        <span>Explanation</span>
      </div>
      <ul className="space-y-2">
        {list.map((reason, i) => (
          <li key={i} className="flex items-start gap-3 text-slate-700">
            <span className="text-brand mt-1 shrink-0">•</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded hover:bg-slate-50">
          <span>🔗</span>
          Copy Link
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded hover:bg-slate-50">
          <span>📄</span>
          Export PDF
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded hover:bg-slate-50">
          <span>📅</span>
          Add to Calendar
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-rose-600 border border-rose-200 rounded hover:bg-rose-50">
          <span>❤️</span>
          Donate
        </button>
      </div>
    </div>
  );
}
