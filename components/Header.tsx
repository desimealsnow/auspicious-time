'use client';

import React from 'react';

export default function Header() {
  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 animate-fadeInUp">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-gentle">
              <span className="text-white font-bold text-lg">✦</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Auspicious Time</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Cosmic Guidance</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-4 sm:space-x-8">
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base">
              About
            </a>
            <a href="#docs" className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base">
              Docs
            </a>
            <button className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors hover:scale-105">
              <span>♥</span>
              <span className="hidden sm:inline">Donate</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}