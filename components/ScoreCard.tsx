export function ScoreCard({ score }: { score: number }) {
  const s = Math.max(0, Math.min(100, score));
  const R = 56;
  const C = 2 * Math.PI * R;
  const off = C - (s / 100) * C;

  return (
    <div className="card p-6 flex items-center gap-6">
      <div className="shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={R}
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="70"
            cy="70"
            r={R}
            stroke="url(#g)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={C}
            strokeDashoffset={off}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
          />
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6C5CE7" />
              <stop offset="100%" stopColor="#00D2D3" />
            </linearGradient>
          </defs>
          <text
            x="70"
            y="76"
            textAnchor="middle"
            fontSize="26"
            fontWeight="600"
            fill="#0f172a"
          >
            {s}
          </text>
          <text x="70" y="95" textAnchor="middle" fontSize="12" fill="#64748b">
            /100
          </text>
        </svg>
      </div>
      <div>
        <div className="text-slate-700 font-semibold text-lg">
          Overall Score
        </div>
        <div className="text-slate-500">
          Personalized cosmic alignment for you
        </div>
        <div className="mt-2 text-sm text-slate-500 flex items-center gap-1">
          <span>★</span>
          <span>{Math.round(s / 25)} / 4</span>
        </div>
      </div>
    </div>
  );
}
