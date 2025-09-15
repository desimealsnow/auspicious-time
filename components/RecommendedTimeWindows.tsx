"use client";

import React from "react";

interface AlternativeTime {
  name: string;
  start: string;
  end: string;
  type: "favorable" | "challenging" | "neutral";
  description: string;
}

interface RecommendedTimeWindowsProps {
  alternativeTimes: AlternativeTime[];
}

export default function RecommendedTimeWindows({
  alternativeTimes,
}: RecommendedTimeWindowsProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (!alternativeTimes || alternativeTimes.length === 0) {
    return null;
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <span className="text-lg">⏰</span>
          <span>Alternative Favorable Times</span>
        </div>
        <span className="text-sm text-slate-500">Better timing options</span>
      </div>

      <div className="space-y-4">
        {alternativeTimes.slice(0, 4).map((timeSlot, index) => {
          const timeRange = `${formatTime(timeSlot.start)} - ${formatTime(
            timeSlot.end
          )}`;

          return (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl hover:from-green-100 hover:to-teal-100 transition-colors cursor-pointer border border-green-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {formatDate(timeSlot.start)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{timeRange}</div>
                  <div className="text-sm text-gray-700 font-medium">
                    {timeSlot.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {timeSlot.description}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">
                  Favorable
                </div>
                <div className="text-xs text-gray-500">Alternative Time</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Why These Times?
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
            These times avoid challenging planetary periods
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
            Better cosmic energy alignment for your activity
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
            Optimal timing based on planetary positions
          </li>
        </ul>
      </div>
    </div>
  );
}
