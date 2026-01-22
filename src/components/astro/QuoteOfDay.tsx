"use client";

import { motion } from "framer-motion";

export default function QuoteOfDay() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <motion.div 
        className="bg-linear-to-r from-amber-lightest via-amber-lighter to-amber-lightest rounded-3xl p-8 md:p-12 border-2 border-amber-light shadow-lg relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-medium/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-light/30 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-ink" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
            <h3 className="text-xl font-bold text-gray-800">Quote of the Day</h3>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-ink rotate-180" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
          </div>
          
          <p className="text-2xl md:text-3xl font-medium text-gray-800 italic leading-relaxed">
            &ldquo;The stars incline, they do not compel. Wisdom lies in understanding their guidance.&rdquo;
          </p>
          
          <motion.p 
            className="text-amber-ink font-semibold text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            — Ancient Vedic Wisdom
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
