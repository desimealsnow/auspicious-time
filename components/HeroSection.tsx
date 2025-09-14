'use client';

import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 py-12 sm:py-16 px-4 sm:px-6 animate-fadeInUp">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-light mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent leading-tight">
          Find Your Perfect Moment
        </h1>
        
        <div className="flex justify-center items-center space-x-2 mb-6 sm:mb-8 animate-pulse-gentle">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" style={{ animationDelay: '0s' }}></span>
          <span className="w-3 h-3 rounded-full bg-green-400 animate-ping" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" style={{ animationDelay: '0.4s' }}></span>
          <span className="text-xl sm:text-2xl animate-spin" style={{ animationDuration: '8s' }}>✦</span>
        </div>
        
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
          Discover the most auspicious times for your important activities using ancient
          Vedic wisdom combined with modern precision. Let the cosmos guide your
          decisions.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
          <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white/50 rounded-full shadow-sm hover:shadow-md transition-shadow">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs sm:text-sm text-gray-700">Vedic Calculations</span>
          </div>
          <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white/50 rounded-full shadow-sm hover:shadow-md transition-shadow">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs sm:text-sm text-gray-700">Personalized Results</span>
          </div>
          <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white/50 rounded-full shadow-sm hover:shadow-md transition-shadow">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-xs sm:text-sm text-gray-700">Precise Timing</span>
          </div>
        </div>
      </div>
    </section>
  );
}