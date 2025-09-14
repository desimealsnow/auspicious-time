'use client';

import React from 'react';

interface RecommendedTimeWindowsProps {
  suggestions: { when: Date; label: string; personalDay: number }[];
}

export default function RecommendedTimeWindows({ suggestions }: RecommendedTimeWindowsProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Recommended Time Windows</h3>
          <span className="text-sm text-gray-500">Find next best slot</span>
        </div>

        <div className="space-y-4">
          {suggestions.slice(0, 3).map((timeSlot, index) => {
            const timeRange = `${formatTime(timeSlot.when)} - ${formatTime(new Date(timeSlot.when.getTime() + 2 * 60 * 60 * 1000))}`;
            
            return (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{formatDate(timeSlot.when)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{timeRange}</div>
                    <div className="text-sm text-gray-600">{timeSlot.label}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-teal-600">Personal Day {timeSlot.personalDay}</div>
                  <div className="text-xs text-gray-500">Favorable</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Explanation</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Tarabala is favorable (Sampat reason)
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Event overlaps with Gulik period - proceed with caution
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Strong Chandrabala score (8/12)
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Nakshatra Swati is generally favorable for travel
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Tithi Dashami supports new beginnings
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
