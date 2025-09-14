export default function ModernHowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Enter Your Details",
      description:
        "Provide your birth information and event details for personalized cosmic calculations.",
      icon: "📋",
      color: "bg-gradient-to-br from-blue-500 to-brand",
    },
    {
      number: 2,
      title: "Vedic Analysis",
      description:
        "Our algorithms analyze Panchang, Tarabala, and celestial factors using ancient wisdom.",
      icon: "🔮",
      color: "bg-gradient-to-br from-teal to-good",
    },
    {
      number: 3,
      title: "Get Guidance",
      description:
        "Receive clear cosmic recommendations and optimal time windows for your activity.",
      icon: "✨",
      color: "bg-gradient-to-br from-warn to-orange-500",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 relative">
      {/* Section Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl backdrop-blur-sm"></div>

      <div className="relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent to-blue-400/50"></div>
            <span className="mx-4 text-blue-300 text-sm font-medium tracking-widest uppercase">
              ⚡ Process
            </span>
            <div className="w-20 h-[1px] bg-gradient-to-l from-transparent to-blue-400/50"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6 leading-tight">
            How It Works
          </h2>
          <p className="text-white/70 text-lg max-w-3xl mx-auto leading-relaxed">
            Three simple steps to unlock cosmic wisdom for your most important
            decisions through ancient Vedic science
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.number} className="group text-center relative">
              {/* Card Background */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                {/* Icon */}
                <div className="relative mb-6">
                  <div
                    className={`w-20 h-20 rounded-3xl ${step.color} flex items-center justify-center text-white text-3xl mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="text-4xl">{step.icon}</span>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <div
                      className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
                    >
                      {step.number}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-white/70 text-base leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                  {step.description}
                </p>
              </div>

              {/* Connection Line (except for last item) */}
              {step.number < 3 && (
                <div className="hidden md:block absolute top-20 -right-6 w-12 h-[2px] bg-gradient-to-r from-white/30 to-white/10"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
