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
      const res = await fetch("/api/astrology/local", {
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
    <div className="mx-auto max-w-4xl px-4">
      <div className="card p-6 md:p-8">
        <h2 className="text-xl font-semibold text-slate-700 text-center">
          Check your muhurta
        </h2>
        <p className="text-slate-500 text-center text-sm">
          Enter your details to find the most auspicious time
        </p>

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

        <div className="mt-6 flex gap-3 justify-center">
          <button
            disabled={loading}
            onClick={submit}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-brand to-teal text-white disabled:opacity-60 font-medium"
          >
            {loading ? "Checking…" : "✨ Check time"}
          </button>
          <button
            onClick={clear}
            className="px-5 py-2 rounded-lg border text-slate-600 hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
