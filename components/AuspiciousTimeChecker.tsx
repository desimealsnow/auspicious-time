'use client';

import React, { useMemo, useState } from 'react';
import RazorpayDonate from './RazorpayDonate';
import { evaluateTime } from '@/lib/evaluator';
import type { EvalAstroWindows, EvalResult } from '@/lib/evaluator';

export default function AuspiciousTimeChecker() {
  const [name, setName] = useState('');
  const [dobDate, setDobDate] = useState(''); // YYYY-MM-DD
  const [dobTime, setDobTime] = useState(''); // HH:MM
  const [activityType, setActivityType] = useState('start');
  const [customActivity, setCustomActivity] = useState('');
  const [targetDT, setTargetDT] = useState(''); // datetime-local
  const [tz, setTz] = useState(
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata'
  );
  const [lat, setLat] = useState<string>('');
  const [lon, setLon] = useState<string>('');
  const [useAstro, setUseAstro] = useState<boolean>(true);

  const [result, setResult] = useState<EvalResult | null>(null);
  const [suggestions, setSuggestions] = useState<
    { when: Date; label: string; personalDay: number }[]
  >([]);
  const [error, setError] = useState('');
  const [astroNote, setAstroNote] = useState('');

  function parseLocal(dateStr: string, timeStr?: string): Date | null {
    try {
      if (!dateStr) return null;
      if (timeStr === undefined) {
        const dt = new Date(dateStr);
        return isNaN(dt.getTime()) ? null : dt;
      }
      const [y, m, d] = dateStr.split('-').map(Number);
      const [hh, mm] = (timeStr || '00:00').split(':').map(Number);
      return new Date(y, m - 1, d, hh, mm);
    } catch {
      return null;
    }
  }

  function fmtDate(d: Date) {
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(d);
    } catch {
      return d.toString();
    }
  }

  async function getAstroWindows(params: {
    dobISO: string;
    targetISO: string;
    lat: number;
    lon: number;
    tz: string;
  }): Promise<EvalAstroWindows | null> {
    try {
      const res = await fetch('/api/astrology/local', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (!data.ok) {
        setAstroNote(String(data.error || 'Astrology provider error.'));
        return null;
      }
      return data as EvalAstroWindows;
    } catch (e: any) {
      setAstroNote(e?.message || 'Astrology API unavailable; used numerology + wellbeing only.');
      return null;
    }
  }

  async function evaluate() {
    setError('');
    setAstroNote('');
    setResult(null);
    setSuggestions([]);

    const dob = parseLocal(dobDate, dobTime);
    const target = parseLocal(targetDT);

    if (!dob || !target) {
      setError('Please provide a valid DOB (date & time) and the intended date & time.');
      return;
    }

    const act =
      activityType === 'custom' && customActivity.trim().length > 0
        ? customActivity.trim()
        : activityType;

    let astro: EvalAstroWindows | undefined;
    if (useAstro) {
      const latNum = Number(lat);
      const lonNum = Number(lon);
      if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
        astro = await getAstroWindows({
          dobISO: dob.toISOString(),
          targetISO: target.toISOString(),
          lat: latNum,
          lon: lonNum,
          tz
        }) ?? undefined;
      } else {
        setAstroNote('Astrology: add latitude/longitude (or click “Use my location”).');
      }
    }

    const evaluated = evaluateTime(
      { dobISO: dob.toISOString(), targetISO: target.toISOString(), activity: act },
      astro
    );

    setResult(evaluated);

    // suggestions (purely time/numerology-based for now)
    const next: { when: Date; label: string; personalDay: number }[] = [];
    for (let i = 1; i <= 7; i++) {
      const day = new Date(target);
      day.setDate(target.getDate() + i);
      const morning = new Date(day); morning.setHours(9, 0, 0, 0);
      const evening = new Date(day); evening.setHours(17, 30, 0, 0);
      next.push({ when: morning, label: 'Morning option', personalDay: (morning.getDate() % 9) || 9 });
      next.push({ when: evening, label: 'Late-afternoon option', personalDay: (evening.getDate() % 9) || 9 });
    }
    setSuggestions(next.slice(0, 8));
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setAstroNote('Geolocation not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLon(String(pos.coords.longitude));
        setAstroNote('Location captured ✓');
      },
      () => setAstroNote('Location denied; enter coordinates manually.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const todayISO = useMemo(
    () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    []
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="mx-auto max-w-4xl px-6 pt-10 pb-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Personal Time Advisor</h1>
        <p className="text-slate-300 mt-2 max-w-2xl">
          Lightweight numerology + wellbeing, with optional Vedic astrology windows (Rahu/Yama/Gulika/Abhijit).
        </p>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-24">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: User details */}
          <div className="bg-slate-900/60 rounded-2xl p-5 shadow-lg ring-1 ring-white/10">
            <h2 className="text-lg font-medium mb-4">Your Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Your name (optional)</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ananya / Rahul…"
                  className="w-full rounded-xl bg-slate-800/80 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Date of birth</label>
                  <input
                    type="date"
                    value={dobDate}
                    onChange={e => setDobDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-800/80 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Time of birth</label>
                  <input
                    type="time"
                    value={dobTime}
                    onChange={e => setDobTime(e.target.value)}
                    className="w-full rounded-xl bg-slate-800/80 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Your time zone</label>
                <input
                  value={tz}
                  onChange={e => setTz(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/80 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-400 mt-1">Detected automatically; adjust if needed.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm mb-1">Latitude</label>
                  <input
                    value={lat}
                    onChange={e => setLat(e.target.value)}
                    placeholder="12.97"
                    className="w-full rounded-xl bg-slate-800/80 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Longitude</label>
                  <input
                    value={lon}
                    onChange={e => setLon(e.target.value)}
                    placeholder="77.59"
                    className="w-full rounded-xl bg-slate-800/80 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={useMyLocation}
                    className="w-full rounded-xl bg-slate-700 hover:bg-slate-600 px-3 py-2 font-medium"
                  >
                    Use my location
                  </button>
                </div>
              </div>
              {astroNote && <p className="text-xs text-amber-300">{astroNote}</p>}
            </div>
          </div>

          {/* Right: Plan */}
          <div className="bg-slate-900/60 rounded-2xl p-5 shadow-lg ring-1 ring-white/10">
            <h2 className="text-lg font-medium mb-4">Your Plan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Activity</label>
                <select
                  value={activityType}
                  onChange={e => setActivityType(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/80 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-emerald-500"
                >
                  <option value="start">Start a new project</option>
                  <option value="sign">Sign a contract</option>
                  <option value="finance">Financial decision</option>
                  <option value="travel">Travel / Relocation</option>
                  <option value="study">Study / Exam / Deep Work</option>
                  <option value="health">Health / Procedure</option>
                  <option value="relationship">Marriage / Relationship</option>
                  <option value="spiritual">Spiritual practice</option>
                  <option value="custom">Custom activity…</option>
                </select>
              </div>
              {activityType === 'custom' && (
                <div>
                  <label className="block text-sm mb-1">Describe the activity</label>
                  <input
                    value={customActivity}
                    onChange={e => setCustomActivity(e.target.value)}
                    placeholder="e.g., launch my app beta, sign MoU, house-warming…"
                    className="w-full rounded-xl bg-slate-800/80 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-emerald-500"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Planned date & time</label>
                  <input
                    type="datetime-local"
                    value={targetDT}
                    onChange={e => setTargetDT(e.target.value)}
                    min={todayISO}
                    className="w-full rounded-xl bg-slate-800/80 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <input
                    id="useAstro"
                    type="checkbox"
                    checked={useAstro}
                    onChange={e => setUseAstro(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="useAstro" className="text-sm">Use Astrology API (Vedic)</label>
                </div>
              </div>
              <button
                onClick={evaluate}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 transition px-4 py-2 font-medium"
              >
                Check my time
              </button>
              {error && <p className="text-sm text-rose-400">{error}</p>}
            </div>
          </div>
        </section>

        {/* Results */}
        {result && (
          <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/60 rounded-2xl p-5 shadow-lg ring-1 ring-white/10">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    result.verdict === 'GOOD'
                      ? 'bg-emerald-600'
                      : result.verdict === 'OKAY'
                      ? 'bg-amber-600'
                      : 'bg-rose-600'
                  } text-white`}
                >
                  {result.verdict}
                </span>
                <h3 className="text-xl font-semibold">
                  {result.verdict === 'GOOD'
                    ? 'Looks Good 👌'
                    : result.verdict === 'OKAY'
                    ? 'Workable with Care ⚖️'
                    : 'Better to Avoid ⛔'}
                </h3>
              </div>
              <p className="text-sm text-slate-300 mb-2">
                Score <span className="font-semibold">{result.score}</span>
                {result.astro?.tithi && <> • Tithi: <span className="font-semibold">{result.astro.tithi}</span></>}
                {result.astro?.nakshatra && <> • Nakshatra: <span className="font-semibold">{result.astro.nakshatra}</span></>}
              </p>
              <ul className="space-y-2 list-disc list-inside text-slate-200">
                {result.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 mt-4">
                Guidance only; for critical life events, consult a professional and confirm local muhurta.
              </p>
            </div>

            <div className="bg-slate-900/60 rounded-2xl p-5 shadow-lg ring-1 ring-white/10">
              <h4 className="text-lg font-medium mb-3">Better Windows (next 7 days)</h4>
              {suggestions.length === 0 ? (
                <p className="text-slate-300 text-sm">No clearly better alternatives within a week.</p>
              ) : (
                <ul className="space-y-3">
                  {suggestions.map((s, idx) => (
                    <li key={idx} className="rounded-xl bg-slate-800/70 p-3">
                      <div className="text-sm font-medium">{s.label}</div>
                      <div className="text-xs text-slate-300">
                        {fmtDate(s.when)} — Personal Day {String(s.personalDay)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* Donate */}
        <section className="mt-10 flex flex-col items-center gap-3">
          <RazorpayDonate />
          <p className="text-xs text-slate-400 text-center max-w-lg">
            Set <code>NEXT_PUBLIC_RAZORPAY_KEY_ID</code> in your environment. For production, create an order server-side and pass <code>order_id</code>.
          </p>
        </section>
      </main>
    </div>
  );
}
