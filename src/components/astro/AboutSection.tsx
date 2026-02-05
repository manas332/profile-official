"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutSection({ name, description }: { name: string, description: string }) {
  // Handle newlines in description
  const paragraphs = description ? description.split('\n\n') : [];

  return (
    <section className="max-w-7xl mx-auto px-6 pt-3 pb-4 md:hidden">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-gray-900">About {name && name.split(' ')[1] ? `Pandit ${name.split(' ')[1]}` : 'the Astrologer'}</h2>
        <motion.div
          className="space-y-4 text-gray-700 leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {paragraphs.length > 0 ? (
            paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))
          ) : (
            <p>Loading details...</p>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
