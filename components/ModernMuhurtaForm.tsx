"use client";

import { useState } from "react";
import type { ApiResp } from "@/lib/types";

type Props = {
  onResult: (r: ApiResp) => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
};

export default function ModernMuhurtaForm({
  onResult,
  loading,
  setLoading,
}: Props) {
  const [dob, setDob] = useState("1989-07-24");
  const [tob, setTob] = useState("06:35");
  const [pob, setPob] = useState("Bengaluru, India");
  const [activity, setActivity] = useState("travel");
  const [eventDate, setEventDate] = useState("2025-09-20");
  const [eventTime, setEventTime] = useState("10:30");
  const [eventLoc, setEventLoc] = useState("Mumbai, India");
  const [lat, setLat] = useState("19.076");
  const [lon, setLon] = useState("72.8777");

  const submit = async () => {
    setLoading(true);
    try {
      const dobISO = new Date(`${dob}T${tob}:00.000Z`).toISOString();
      const targetISO = new Date(
        `${eventDate}T${eventTime}:00.000Z`
      ).toISOString();
      const res = await fetch("/api/astrology/enhanced", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dobISO,
          targetISO,
          lat: Number(lat),
          lon: Number(lon),
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          activity,
        }),
      });
      const data: ApiResp = await res.json();
      onResult(data);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Request failed";
      onResult({ ok: false, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setActivity("travel");
  };

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Form Background Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-yellow-400/20 to-orange-500/20 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-purple-400/50"></div>
              <span className="mx-3 text-purple-300 text-xs font-medium tracking-widest uppercase">
                🔮 Muhurta Analysis
              </span>
              <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-purple-400/50"></div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Check Your Perfect Timing
            </h2>
            <p className="text-white/70 text-base leading-relaxed max-w-2xl mx-auto">
              Enter your details to discover the most auspicious time for your
              important activity
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date of birth */}
            <div>
              <label className="label">Date of birth</label>
              <input
                className="input"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            {/* Place of birth */}
            <div>
              <label className="label">Place of birth</label>
              <input
                className="input"
                placeholder="City, Country"
                value={pob}
                onChange={(e) => setPob(e.target.value)}
              />
            </div>

            {/* Time of birth */}
            <div>
              <label className="label">Time of birth</label>
              <input
                className="input"
                type="time"
                value={tob}
                onChange={(e) => setTob(e.target.value)}
              />
            </div>

            {/* Activity and Event time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Activity</label>
                <select
                  className="input"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                >
                  <option value="travel">Travel</option>
                  <option value="marriage">Marriage</option>
                  <option value="new_business">New business</option>
                  <option value="puja">Puja</option>
                  <option value="interview">Interview</option>
                  <option value="property">Property</option>
                  <option value="surgery">Surgery</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="label">Event time</label>
                <input
                  className="input"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
            </div>

            {/* Event date */}
            <div>
              <label className="label">Event date</label>
              <input
                className="input"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            {/* Event location */}
            <div>
              <label className="label">Event location</label>
              <input
                className="input"
                placeholder="City, Country"
                value={eventLoc}
                onChange={(e) => setEventLoc(e.target.value)}
              />
            </div>

            {/* Lat/Lon for API */}
            <div>
              <label className="label">Latitude</label>
              <input
                className="input"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input
                className="input"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-10 flex gap-4 justify-center">
            <button
              disabled={loading}
              onClick={submit}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 min-w-[160px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-200"></div>
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">✨</span>
                    <span>Check Time</span>
                  </>
                )}
              </div>
            </button>
            <button
              onClick={clear}
              className="px-6 py-4 border border-white/30 text-white/80 hover:text-white hover:bg-white/10 font-medium rounded-2xl transition-all duration-200 hover:border-white/50"
            >
              Clear Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
