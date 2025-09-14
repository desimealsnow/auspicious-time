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
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif bg-gradient-to-r from-brand to-teal bg-clip-text text-transparent mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Three simple steps to unlock cosmic wisdom for your important
          decisions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="text-center">
            <div
              className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg`}
            >
              <span className="text-3xl">{step.icon}</span>
            </div>
            <div
              className={`w-8 h-8 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-sm mx-auto mb-4`}
            >
              {step.number}
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {step.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
