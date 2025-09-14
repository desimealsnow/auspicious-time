/**
 * Renders the Hero section of the application.
 */
export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 pb-6 text-center">
      <div className="mx-auto max-w-3xl card p-8">
        <h1 className="text-4xl md:text-5xl font-serif bg-gradient-to-r from-brand to-teal bg-clip-text text-transparent">
          Find Your Perfect Moment
        </h1>
        <p className="mt-4 text-slate-600">
          Discover the most auspicious times for your important activities using
          ancient Vedic wisdom combined with modern precision. Let the cosmos
          guide your decisions.
        </p>
        <div className="mt-3 text-xs text-slate-500 flex gap-6 justify-center">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-brand"></span>
            Vedic Calculations
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-warn"></span>
            Personalized Results
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal"></span>
            Precise Timing
          </span>
        </div>
      </div>
    </section>
  );
}
