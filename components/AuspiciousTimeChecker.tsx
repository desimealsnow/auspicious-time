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
import RecommendedTimeWindows from "./RecommendedTimeWindows";
import Footer from "./Footer";
import type { ApiResp } from "@/lib/types";

export default function AuspiciousTimeChecker() {
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ApiResp | undefined>(undefined);

  const windows = resp?.time_windows?.all_periods
    ? resp.time_windows.all_periods.map((period) => ({
        label: period.name,
        color:
          period.type === "favorable"
            ? "#06b6d4"
            : period.type === "challenging"
            ? "#ef4444"
            : "#f59e0b",
        list: [{ start: period.start, end: period.end }],
        description: period.description,
        type: period.type,
      }))
    : resp
    ? [
        {
          label: "Favorable Periods",
          color: "#10b981",
          list: resp.abhijit_muhurta ?? [],
        },
        {
          label: "Challenging Periods",
          color: "#ef4444",
          list: resp.rahu_kalam ?? [],
        },
        {
          label: "Restrictive Periods",
          color: "#f59e0b",
          list: resp.yamaganda ?? [],
        },
        {
          label: "Shadow Periods",
          color: "#f97316",
          list: resp.gulika_kalam ?? [],
        },
      ]
    : [];

  const getStatusFromValue = (
    value: string,
    isGood?: boolean
  ): "good" | "neutral" | "bad" => {
    if (isGood === undefined) return "neutral";
    return isGood ? "good" : "bad";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white relative overflow-hidden">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 opacity-50">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-32 left-1/3 w-36 h-36 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>

      {/* Content */}
      <div className="relative z-10">
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

              {(resp.verdict || resp.activity) && <VerdictStrip r={resp} />}

              {/* Your Muhurta Analysis */}
              {(resp.verdict || resp.activity) && (
                <div>
                  <h2 className="text-2xl font-semibold text-center mb-2">
                    Your Muhurta Analysis
                  </h2>
                  <p className="text-slate-600 text-center text-sm mb-8">
                    Based on your birth details and chosen activity
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ScoreCard
                      score={resp.verdict?.score ?? resp.activity?.score ?? 0}
                    />
                    <InfoCard
                      title="Stellar Compatibility"
                      value={
                        resp.tarabala
                          ? resp.tarabala.isGood
                            ? "Favorable"
                            : "Unfavorable"
                          : resp.activity?.confidence === "high"
                          ? "Strong"
                          : "Moderate"
                      }
                      sub={
                        resp.tarabala?.name ||
                        resp.activity?.confidence ||
                        "Analysis"
                      }
                      status={getStatusFromValue(
                        resp.tarabala?.name ?? resp.activity?.confidence ?? "",
                        resp.tarabala?.isGood ??
                          (resp.activity?.score ?? 0) > 60
                      )}
                    />
                    <InfoCard
                      title="Lunar Harmony"
                      value={
                        resp.chandrabala
                          ? `${resp.chandrabala.relation}/12`
                          : resp.activity?.score
                          ? `${Math.floor((resp.activity.score ?? 0) / 10)}/10`
                          : "—"
                      }
                      sub={
                        resp.chandrabala?.isGood
                          ? "Good moon relationship harmony level"
                          : resp.activity?.score
                          ? (resp.activity.score ?? 0) > 60
                            ? "Favorable"
                            : "Challenging"
                          : "Analysis"
                      }
                      status={getStatusFromValue(
                        resp.chandrabala?.relation.toString() ??
                          resp.activity?.score?.toString() ??
                          "",
                        resp.chandrabala?.isGood ??
                          (resp.activity?.score ?? 0) > 60
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

              {/* Show alternative favorable times if current time is not good */}
              {resp.time_windows?.alternative_times &&
                resp.time_windows.alternative_times.length > 0 && (
                  <RecommendedTimeWindows
                    alternativeTimes={resp.time_windows.alternative_times}
                  />
                )}

              <Reasons
                list={
                  resp.verdict?.reasons || resp.recommendations
                    ? [
                        resp.recommendations?.immediate,
                        resp.recommendations?.optimal_timing,
                        resp.recommendations?.general_advice,
                      ].filter((item): item is string => Boolean(item))
                    : []
                }
              />
            </section>
          )}
        </main>

        <ModernHowItWorks />
        <Footer />
      </div>
    </div>
  );
}
