'use client';

import React, { useState, useMemo } from 'react';

interface MuhurtaFormProps {
  onSubmit: (formData: {
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
  }) => void;
  loading?: boolean;
}

export default function MuhurtaForm({ onSubmit, loading = false }: MuhurtaFormProps) {
  const [dobDate, setDobDate] = useState('1989-07-24');
  const [dobTime, setDobTime] = useState('06:35');
  const [unknownTime, setUnknownTime] = useState(false);
  const [dobLocation, setDobLocation] = useState('Bengaluru, India');
  const [activity, setActivity] = useState('Travel');
  const [customActivity, setCustomActivity] = useState('');
  const [eventDate, setEventDate] = useState('2025-09-20');
  const [eventTime, setEventTime] = useState('10:30');
  const [eventLocation, setEventLocation] = useState('Mumbai, India');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [tz] = useState(
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata'
  );

  const todayISO = useMemo(
    () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    []
  );

  const handleSubmit = () => {
    const formData = {
      dobDate,
      dobTime: unknownTime ? '' : dobTime,
      dobLocation,
      activity,
      customActivity,
      eventDate,
      eventTime,
      eventLocation,
      lat,
      lon,
      tz
    };
    onSubmit(formData);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLon(String(pos.coords.longitude));
      },
      () => alert('Location access denied; enter coordinates manually.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-10 animate-fadeInUp">
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Check your muhurta</h2>
          <p className="text-gray-600">Enter your details to find the most auspicious time</p>
          <div className="flex justify-center items-center space-x-1 mt-4">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span className="w-2 h-2 rounded-full bg-teal-300"></span>
            <span className="w-2 h-2 rounded-full bg-teal-200"></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Birth Details */}
          <div className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="w-4 h-4 mr-2">📅</span>
                Date of birth
              </label>
              <input
                type="date"
                value={dobDate}
                onChange={e => setDobDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="w-4 h-4 mr-2">🕐</span>
                Time of birth
              </label>
              <input
                type="time"
                value={dobTime}
                onChange={e => setDobTime(e.target.value)}
                disabled={unknownTime}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:bg-gray-50"
              />
              <label className="flex items-center mt-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={unknownTime}
                  onChange={e => setUnknownTime(e.target.checked)}
                  className="mr-2 w-4 h-4 text-teal-600 rounded"
                />
                Unknown time
              </label>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="w-4 h-4 mr-2">📍</span>
                Place of birth
              </label>
              <input
                type="text"
                value={dobLocation}
                onChange={e => setDobLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Column - Event Details */}
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Activity</label>
              <select
                value={activity}
                onChange={e => setActivity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="Travel">Travel</option>
                <option value="start">Start a new project</option>
                <option value="sign">Sign a contract</option>
                <option value="finance">Financial decision</option>
                <option value="study">Study / Exam</option>
                <option value="health">Health / Procedure</option>
                <option value="relationship">Marriage / Relationship</option>
                <option value="spiritual">Spiritual practice</option>
                <option value="custom">Custom activity…</option>
              </select>
              {activity === 'custom' && (
                <input
                  type="text"
                  value={customActivity}
                  onChange={e => setCustomActivity(e.target.value)}
                  placeholder="Describe your activity"
                  className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Event date</label>
              <input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                min={todayISO}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="w-4 h-4 mr-2">🕐</span>
                Event time
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={e => setEventTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="w-4 h-4 mr-2">📍</span>
                Event location
              </label>
              <input
                type="text"
                value={eventLocation}
                onChange={e => setEventLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Location coordinates section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Location for Astrology</h3>
            <button
              type="button"
              onClick={useMyLocation}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <span>📍</span>
              <span>Use my location</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={e => setLat(e.target.value)}
                placeholder="12.9716"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                value={lon}
                onChange={e => setLon(e.target.value)}
                placeholder="77.5946"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Location coordinates are needed for accurate astrological calculations. Click &quot;Use my location&quot; for automatic detection.
          </p>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-0 sm:justify-between">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 sm:mr-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Analyzing...
              </div>
            ) : (
              <>
                <span className="mr-2">✦</span>
                Check time
                <span className="ml-2">✦</span>
              </>
            )}
          </button>
          <button
            type="button"
            className="px-6 py-4 text-gray-600 hover:text-gray-800 transition-colors hover:bg-gray-50 rounded-xl sm:w-auto w-full"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}