'use client';

import React from 'react';
import type { EvalResult } from '@/lib/evaluator';

interface MuhurtaResultsProps {
  result: EvalResult;
}

interface CircularProgressProps {
  score: number;
  size?: number;
}

function CircularProgress({ score, size = 120 }: CircularProgressProps) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#10b981"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{score}</span>
      </div>
    </div>
  );
}

export default function MuhurtaResults({ result }: MuhurtaResultsProps) {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'GOOD':
        return 'from-green-400 to-emerald-500';
      case 'OKAY':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-red-400 to-pink-500';
    }
  };

  const getVerdictText = (verdict: string) => {
    switch (verdict) {
      case 'GOOD':
        return 'This is an auspicious time for your activity';
      case 'OKAY':
        return 'This time is moderately favorable';
      default:
        return 'Consider choosing a different time';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fadeInUp">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Muhurta Analysis</h2>
        <p className="text-gray-600 px-4">Based on your birth details and chosen activity</p>
      </div>

      {/* Main Result Banner */}
      <div className={`bg-gradient-to-r ${getVerdictColor(result.verdict)} rounded-2xl p-6 mb-8 text-white shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-full p-2">
              <span className="text-2xl">
                {result.verdict === 'GOOD' ? '✨' : result.verdict === 'OKAY' ? '⚡' : '⚠️'}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium opacity-90 uppercase tracking-wide">
                {result.verdict}
              </div>
              <div className="text-xl font-semibold">{getVerdictText(result.verdict)}</div>
            </div>
          </div>
          <div className="text-2xl">✦</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Overall Score */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Overall Score
          </h3>
          <div className="flex justify-center mb-4">
            <CircularProgress score={result.score} />
          </div>
          <p className="text-sm text-gray-600 text-center">
            <span className="text-yellow-600">⚡</span> Personalized cosmic alignment for you
          </p>
        </div>

        {/* Tarabala */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⭐</span>
            Tarabala
          </h3>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {result.astro?.nakshatra || 'Neutral'}
            </div>
            <div className="flex justify-center space-x-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-yellow-400">⭐</span>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {result.astro?.nakshatra ? 'Favorable star alignment' : 'Standard influence'}
            </p>
          </div>
        </div>

        {/* Chandrabala */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🌙</span>
            Chandrabala
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {Math.floor(result.score / 10)}
            </div>
            <div className="text-sm text-gray-600 mb-2">/12</div>
            <div className="flex justify-center space-x-1 mb-3">
              <span className="text-yellow-400">⭐</span>
              <span className="text-yellow-400">⭐</span>
            </div>
            <p className="text-sm text-gray-600">
              Moon relationship harmony level
            </p>
          </div>
        </div>
      </div>

      {/* Panchang Details */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <span className="mr-2">🏛️</span>
          Panchang Details
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="w-3 h-3 bg-orange-400 rounded-full mr-2"></span>
              <span className="text-sm font-medium text-gray-700">Sunrise</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">06:18</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="w-3 h-3 bg-red-400 rounded-full mr-2"></span>
              <span className="text-sm font-medium text-gray-700">Sunset</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">18:34</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
              <span className="text-sm font-medium text-gray-700">Tithi</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {result.astro?.tithi || 'Shukla Dashami (10)'}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="w-3 h-3 bg-teal-400 rounded-full mr-2"></span>
              <span className="text-sm font-medium text-gray-700">Nakshatra</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {result.astro?.nakshatra || 'Swati (15)'}
            </div>
          </div>
        </div>

        {/* Day Timeline */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
            <span className="mr-2">📅</span>
            Day Timeline • Cosmic periods of the day
          </h4>
          <div className="relative">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>6:00</span>
              <span>9:00</span>
              <span>12:00</span>
              <span>15:00</span>
              <span>18:00</span>
            </div>
            <div className="flex h-4 rounded-lg overflow-hidden">
              <div className="bg-red-400 flex-1"></div>
              <div className="bg-orange-400 flex-1"></div>
              <div className="bg-teal-400 flex-1"></div>
              <div className="bg-red-500 flex-1"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Explanation</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {result.reasons.map((reason, index) => (
            <li key={index} className="flex items-start">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              {reason}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <button className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
            <span className="mr-2">🔗</span>
            Copy Link
          </button>
          <button className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
            <span className="mr-2">📄</span>
            Export PDF
          </button>
          <button className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
            <span className="mr-2">📅</span>
            Add to Calendar
          </button>
          <button className="flex items-center px-4 py-2 text-sm text-red-500 hover:text-red-600 transition-colors">
            <span className="mr-2">♥</span>
            Donate
          </button>
        </div>
      </div>
    </div>
  );
}