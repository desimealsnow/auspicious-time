'use client';

import React, { useEffect, useState } from 'react';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
      aria-labelledby="hero-heading"
      role="banner"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl opacity-70 transition-transform duration-1000 ease-out"
          style={{
            top: '10%',
            right: '10%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-500/20 rounded-full blur-3xl opacity-60 transition-transform duration-1000 ease-out"
          style={{
            bottom: '20%',
            left: '15%',
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-br from-blue-400/15 to-teal-500/15 rounded-full blur-3xl opacity-50 transition-transform duration-1000 ease-out"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Hero Card */}
      <div 
        className={`relative z-10 mx-auto max-w-6xl w-full transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 border border-white/20 rounded-3xl lg:rounded-4xl p-6 sm:p-8 md:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
          {/* Enhanced glassmorphism effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl lg:rounded-4xl" />
          
          {/* Content Container */}
          <div className="relative z-10 text-center">
            {/* Badge */}
            <div 
              className={`inline-flex items-center justify-center mb-6 sm:mb-8 transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-lg border border-white/30 rounded-full">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-[1px] bg-gradient-to-r from-transparent to-yellow-400/60" />
                  <span className="text-yellow-300 text-xs sm:text-sm font-semibold tracking-widest uppercase select-none">
                    ✨ Cosmic Guidance ✨
                  </span>
                  <div className="w-3 h-[1px] bg-gradient-to-l from-transparent to-yellow-400/60" />
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <div 
              className={`mb-6 sm:mb-8 transition-all duration-700 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <h1 
                id="hero-heading"
                className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif leading-[1.1] mb-2 sm:mb-4"
              >
                <span className="block bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent animate-gradient-x">
                  Find Your Perfect
                </span>
                <span className="block bg-gradient-to-r from-purple-200 via-blue-200 to-teal-200 bg-clip-text text-transparent animate-gradient-x">
                  Moment
                </span>
              </h1>
            </div>

            {/* Description */}
            <div 
              className={`mb-8 sm:mb-10 transition-all duration-700 delay-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-light">
                Discover the most auspicious times for your important activities using ancient{' '}
                <span className="text-yellow-300 font-semibold relative">
                  Vedic wisdom
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-400/0 via-yellow-400/60 to-yellow-400/0" />
                </span>{' '}
                combined with modern{' '}
                <span className="text-blue-300 font-semibold relative">
                  precision
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400/0 via-blue-400/60 to-blue-400/0" />
                </span>
                . Let the cosmos guide your most important decisions.
              </p>
            </div>

            {/* Enhanced Feature Pills */}
            <div 
              className={`flex flex-wrap gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 transition-all duration-700 delay-900 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              role="list"
              aria-label="Key features"
            >
              {[
                { 
                  icon: '🔮', 
                  text: 'Vedic Calculations', 
                  gradient: 'from-purple-400 to-pink-400',
                  description: 'Ancient astronomical calculations'
                },
                { 
                  icon: '✨', 
                  text: 'Personalized Results', 
                  gradient: 'from-yellow-400 to-orange-400',
                  description: 'Tailored to your location and needs'
                },
                { 
                  icon: '⏰', 
                  text: 'Precise Timing', 
                  gradient: 'from-blue-400 to-teal-400',
                  description: 'Accurate to the minute'
                }
              ].map((feature, index) => (
                <div 
                  key={feature.text}
                  role="listitem"
                  className="group relative"
                  style={{ animationDelay: `${1100 + index * 200}ms` }}
                >
                  <div 
                    className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-lg border border-white/30 rounded-full hover:bg-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-default focus:outline-none focus:ring-2 focus:ring-white/50"
                    tabIndex={0}
                    aria-label={`${feature.text}: ${feature.description}`}
                  >
                    <span className="text-lg sm:text-xl select-none" role="img" aria-hidden="true">
                      {feature.icon}
                    </span>
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient} animate-pulse`} />
                    <span className="text-white/95 font-medium text-sm sm:text-base whitespace-nowrap">
                      {feature.text}
                    </span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                    {feature.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80" />
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced CTA */}
            <div 
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-1300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg" />
                <span className="text-white/80 text-sm sm:text-base font-medium">
                  Scroll down to begin your cosmic journey
                </span>
              </div>
              
              {/* Scroll indicator */}
              <div className="flex flex-col items-center gap-2 sm:ml-4">
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        .animate-gradient-x {
          animation: gradient-x 8s ease infinite;
        }
        
        @media (max-width: 475px) {
          .xs\\:text-4xl {
            font-size: 2.25rem;
            line-height: 2.5rem;
          }
        }
      `}</style>
    </section>
  );
}
