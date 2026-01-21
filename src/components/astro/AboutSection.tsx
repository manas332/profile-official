import PanchangCard from "./PanchangCard";

export default function AboutSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left - Detailed Description */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">About the Astrologer</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              With over 15 years of dedicated practice in Vedic Astrology, Pandit Sharma has helped thousands 
              of individuals navigate life's challenges and opportunities. His deep understanding of planetary 
              positions, birth charts, and cosmic energies enables him to provide accurate predictions and 
              practical remedies.
            </p>
            <p>
              Specializing in personalized Kundli readings, he offers insights into career progression, 
              relationship compatibility, health concerns, and spiritual development. His approach combines 
              traditional Vedic wisdom with contemporary understanding, making ancient knowledge accessible 
              and applicable to modern life.
            </p>
            <p>
              Pandit Sharma is also an expert in gemstone therapy, helping clients select the right stones 
              to enhance positive energies and mitigate planetary afflictions. Each consultation is tailored 
              to your unique birth chart and current life circumstances.
            </p>
          </div>
        </div>

        {/* Right - Today's Panchang */}
        <PanchangCard />
      </div>
    </section>
  );
}
