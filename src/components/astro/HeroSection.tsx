"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10 md:py-16">
      <div className="grid grid-cols-2 md:grid-cols-2 gap-6 md:gap-12 md:items-stretch">
        {/* Left column - Name/experience and About content */}
        <motion.div 
          className="space-y-6 col-start-1 row-start-1 md:col-start-1 md:flex md:flex-col"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Name/experience section */}
          <div className="space-y-2">
            <motion.h1 
              className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Pandit Sharma
            </motion.h1>
            <motion.p 
              className="text-base sm:text-xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              15 Years of Experience
            </motion.p>

            {/* Desktop-only: keep description to fill space */}
            <motion.div 
              className="hidden md:block text-lg text-gray-700 leading-relaxed mt-4 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
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
            </motion.div>
          </div>
        </motion.div>

        {/* Image (right). Single instance (no duplicates). */}
        <motion.div 
          className="relative col-start-2 row-start-1 justify-self-end w-full max-w-[160px] sm:max-w-xs md:max-w-[400px] md:h-full"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div 
            className="aspect-3/4 md:h-full bg-linear-to-br from-amber-lighter to-amber-light rounded-3xl overflow-hidden shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/astro-img.jpg"
              alt="Pandit Sharma - Vedic Astrologer"
              width={600}
              height={800}
              className="w-full h-full object-cover"
              priority
            />
          </motion.div>
          <motion.div 
            className="absolute -bottom-6 -left-6 w-24 h-24 md:w-32 md:h-32 bg-amber-light/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>
          <motion.div 
            className="absolute -top-6 -right-6 w-24 h-24 md:w-32 md:h-32 bg-amber-medium/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          ></motion.div>
        </motion.div>
      </div>

      {/* Skills - below description and image */}
      <motion.div 
        className="mt-8 md:mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-2 justify-start">
          {["Kundli Analysis", "Gemstones", "Career Guidance"].map((skill, index) => (
            <motion.span
              key={skill}
              className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-amber-lightest text-amber-ink rounded-full text-xs sm:text-sm md:text-base font-semibold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
