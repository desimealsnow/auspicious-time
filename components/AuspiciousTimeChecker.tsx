"use client";

import { useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import ModernMuhurtaForm from "./ModernMuhurtaForm";
import VerdictStrip from "./VerdictStrip";
import { ScoreCard } from "./ScoreCard";
import { InfoCard } from "./InfoCard";
import PanchangCard from "./PanchangCard";
import TimelineBar from "./TimelineBar";
import SafeWindows from "./SafeWindows";
import Reasons from "./Reasons";
import ModernHowItWorks from "./ModernHowItWorks";
import Footer from "./Footer";
import type { ApiResp } from "@/lib/types";

/**
 * Renders the Auspicious Time Checker component.
 *
 * This component manages the loading state and API response for auspicious time calculations. It displays various time windows based on the response, handles error messages, and presents a detailed analysis of the Muhurta based on user input. The component also utilizes helper functions to determine the status of specific astrological factors.
 *
 * @returns JSX.Element representing the Auspicious Time Checker UI.
 */
export default function AuspiciousTimeChecker() {
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ApiResp | undefined>(undefined);

  const windows = resp
    ? [
        {
          label: "Abhijit",
          color: "#06b6d4",
          list: resp.abhijit_muhurta ?? [],
        },
        { label: "Rahu", color: "#ef4444", list: resp.rahu_kalam ?? [] },
        { label: "Yamaganda", color: "#f59e0b", list: resp.yamaganda ?? [] },
        { label: "Gulika", color: "#f97316", list: resp.gulika_kalam ?? [] },
      ]
    : [];

  /**
   * Returns the status based on the provided value and isGood flag.
   */
  const getStatusFromValue = (
    value: string,
    isGood?: boolean
  ): "good" | "neutral" | "bad" => {
    if (isGood === undefined) return "neutral";
    return isGood ? "good" : "bad";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-ink">
      <Header />
      <Hero />

      <main className="mx-auto max-w-6xl px-4 space-y-8">
        <ModernMuhurtaForm
          onResult={setResp}
          loading={loading}
          setLoading={setLoading}
        />

        {resp && (
          <section className="space-y-8">
            {resp.error && (
              <div className="card p-4 text-rose-600 border-rose-200 bg-rose-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-rose-500">⚠️</span>
                  <span className="font-medium">Error</span>
                </div>
                <p className="mt-1">{resp.error}</p>
              </div>
            )}

            {resp.verdict && <VerdictStrip r={resp} />}

            {/* Your Muhurta Analysis */}
            {resp.verdict && (
              <div>
                <h2 className="text-2xl font-semibold text-center mb-2">
                  Your Muhurta Analysis
                </h2>
                <p className="text-slate-600 text-center text-sm mb-8">
                  Based on your birth details and chosen activity
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ScoreCard score={resp.verdict?.score ?? 0} />
                  <InfoCard
                    title="Tarabala"
                    value={
                      resp.tarabala
                        ? resp.tarabala.isGood
                          ? "Favorable"
                          : "Unfavorable"
                        : "Neutral"
                    }
                    sub={resp.tarabala?.name}
                    status={getStatusFromValue(
                      resp.tarabala?.name ?? "",
                      resp.tarabala?.isGood
                    )}
                  />
                  <InfoCard
                    title="Chandrabala"
                    value={
                      resp.chandrabala ? `${resp.chandrabala.relation}/12` : "—"
                    }
                    sub={
                      resp.chandrabala?.isGood
                        ? "Good moon relationship harmony level"
                        : "Neutral"
                    }
                    status={getStatusFromValue(
                      resp.chandrabala?.relation.toString() ?? "",
                      resp.chandrabala?.isGood
                    )}
                  />
                </div>
              </div>
            )}

            <PanchangCard r={resp} />

            {resp.sunrise && resp.sunset && (
              <TimelineBar
                sunrise={resp.sunrise}
                sunset={resp.sunset}
                windows={windows}
              />
            )}

            <SafeWindows list={resp.safe_windows} />
            <Reasons list={resp.verdict?.reasons} />
          </section>
        )}
      </main>

      <ModernHowItWorks />
      <Footer />
    </div>
  );
}
