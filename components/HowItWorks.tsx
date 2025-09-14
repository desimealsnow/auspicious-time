'use client';

import React from 'react';

export default function HowItWorks() {
  return (
    <section className="py-12 sm:py-16 bg-white animate-fadeInUp">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto px-4">
            Three simple steps to unlock cosmic wisdom for your important decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Step 1 */}
          <div className="text-center group cursor-pointer">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <span className="text-white text-xl sm:text-2xl font-bold">1</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Enter Your Details</h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Provide your birth information and event details for personalized cosmic calculations.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center group cursor-pointer" style={{animationDelay: '0.2s'}}>
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <span className="text-white text-xl sm:text-2xl font-bold">2</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">Vedic Analysis</h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Our algorithms analyze Panchang, Tarabala, and celestial factors using ancient wisdom.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center group cursor-pointer" style={{animationDelay: '0.4s'}}>
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <span className="text-white text-xl sm:text-2xl font-bold">3</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Get Guidance</h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Receive clear cosmic recommendations and optimal time windows for your activity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
