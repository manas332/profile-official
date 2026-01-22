"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PanchangCard() {
  // In a real app, this would fetch from an API
  const panchangData = {
    date: "14 Jan 2026",
    tithi: "Shukla Paksha",
    nakshatra: "Rohini",
    yoga: "Siddha",
    karana: "Bava",
    sunrise: "07:12 AM",
    sunset: "05:48 PM",
  };

  const panchangItems = [
    { label: "Date", value: panchangData.date },
    { label: "Tithi", value: panchangData.tithi },
    { label: "Nakshatra", value: panchangData.nakshatra },
    { label: "Yoga", value: panchangData.yoga },
    { label: "Karana", value: panchangData.karana },
    { label: "Sunrise", value: panchangData.sunrise },
    { label: "Sunset", value: panchangData.sunset },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 pt-8 pb-8">
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-2xl font-bold text-gray-900">Today's Panchang</h3>
        <Card className="bg-linear-to-br from-amber-lightest to-amber-lighter border-amber-light shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3 text-sm">
              {panchangItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  className={`flex justify-between ${index < panchangItems.length - 2 ? "pb-3 border-b border-amber-light" : ""}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <span className="text-gray-600 font-medium">{item.label}</span>
                  <span className="text-gray-900 font-semibold">{item.value}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
