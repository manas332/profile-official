import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left - Brief Description */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-amber-ink font-semibold">Vedic Astrologer</p>
            <h1 className="text-5xl font-bold text-gray-900">Pandit Sharma</h1>
            <p className="text-xl text-gray-600">15 Years of Experience</p>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-gray-700 leading-relaxed">
              Expert in Vedic Astrology, Kundli Reading, and Gemstone Consultation. 
              Providing personalized guidance for life, career, relationships, and spiritual growth.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 bg-amber-lightest text-amber-ink rounded-full text-sm font-semibold">Kundli Analysis</span>
              <span className="px-4 py-2 bg-amber-lighter text-amber-ink rounded-full text-sm font-semibold">Gemstones</span>
              <span className="px-4 py-2 bg-amber-lightest text-amber-ink rounded-full text-sm font-semibold">Career Guidance</span>
            </div>
          </div>
        </div>

        {/* Right - Image */}
        <div className="relative">
          <div className="aspect-3/4 bg-linear-to-br from-amber-lighter to-amber-light rounded-3xl overflow-hidden shadow-2xl">
            <Image 
              src="/astro-img.jpg" 
              alt="Pandit Sharma - Vedic Astrologer" 
              width={600} 
              height={800}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-light/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-medium/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}
