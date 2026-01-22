"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-3 pb-4 md:hidden">
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-gray-900">About the Astrologer</h2>
        <motion.div 
          className="space-y-4 text-gray-700 leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
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
      </motion.div>
    </section>
  );
}
