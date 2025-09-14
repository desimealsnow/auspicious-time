'use client';

import React, { useState } from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import MuhurtaForm from './MuhurtaForm';
import MuhurtaResults from './MuhurtaResults';
import RecommendedTimeWindows from './RecommendedTimeWindows';
import HowItWorks from './HowItWorks';
import { evaluateTime } from '@/lib/evaluator';
import type { EvalAstroWindows, EvalResult } from '@/lib/evaluator';

export default function AuspiciousTimeChecker() {
  const [result, setResult] = useState<EvalResult | null>(null);
  const [suggestions, setSuggestions] = useState<
    { when: Date; label: string; personalDay: number }[]
  >([]);
  const [error, setError] = useState('');
  const [astroNote, setAstroNote] = useState('');
  const [loading, setLoading] = useState(false);

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
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Astrology API unavailable; used numerology + wellbeing only.';
      setAstroNote(errorMessage);
      return null;
    }
  }

  const handleFormSubmit = async (formData: {
    dobDate: string;
    dobTime: string;
    dobLocation: string;
    activity: string;
    customActivity: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    lat: string;
    lon: string;
    tz: string;
  }) => {
    setLoading(true);
    setError('');
    setAstroNote('');
    setResult(null);
    setSuggestions([]);

    try {
      const dob = parseLocal(formData.dobDate, formData.dobTime);
      const target = parseLocal(formData.eventDate + 'T' + formData.eventTime);

      if (!dob || !target) {
        setError('Please provide a valid DOB and event date/time.');
        return;
      }

      const act = formData.activity === 'custom' && formData.customActivity.trim().length > 0
        ? formData.customActivity.trim()
        : formData.activity;

      let astro: EvalAstroWindows | undefined;
      const latNum = Number(formData.lat);
      const lonNum = Number(formData.lon);
      
      if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
        astro = await getAstroWindows({
          dobISO: dob.toISOString(),
          targetISO: target.toISOString(),
          lat: latNum,
          lon: lonNum,
          tz: formData.tz
        }) ?? undefined;
      }

      const evaluated = evaluateTime(
        { dobISO: dob.toISOString(), targetISO: target.toISOString(), activity: act },
        astro
      );

      setResult(evaluated);

      // Generate suggestions
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      
      <MuhurtaForm onSubmit={handleFormSubmit} loading={loading} />
      
      {error && (
        <div className="max-w-2xl mx-auto px-6 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        </div>
      )}
      
      {astroNote && (
        <div className="max-w-2xl mx-auto px-6 mt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700">
            {astroNote}
          </div>
        </div>
      )}

      {result && (
        <>
          <MuhurtaResults result={result} />
          <RecommendedTimeWindows suggestions={suggestions} />
        </>
      )}

      {!result && <HowItWorks />}
    </div>
  );
}
