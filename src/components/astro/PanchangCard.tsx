"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { MhahPanchang } from "mhah-panchang";

interface PanchangData {
  date: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  paksha: string;
  raasi: string;
}

export default function PanchangCard() {
  const [panchangData, setPanchangData] = useState<PanchangData | null>(null);

  useEffect(() => {
    try {
      const panchang = new MhahPanchang();
      const now = new Date();
      const result = panchang.calculate(now);

      setPanchangData({
        date: now.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        tithi: result.Tithi?.name_en_IN || "N/A",
        nakshatra: result.Nakshatra?.name_en_IN || "N/A",
        yoga: result.Yoga?.name_en_IN || "N/A",
        karana: result.Karna?.name_en_IN || "N/A",
        paksha: result.Paksha?.name_en_IN || "N/A",
        raasi: result.Raasi?.name_en_UK || "N/A",
      });
    } catch (error) {
      console.error("Error calculating panchang:", error);
      // Fallback data
      setPanchangData({
        date: new Date().toLocaleDateString('en-IN'),
        tithi: "Loading...",
        nakshatra: "Loading...",
        yoga: "Loading...",
        karana: "Loading...",
        paksha: "Loading...",
        raasi: "Loading...",
      });
    }
  }, []);

  if (!panchangData) {
    return null;
  }

  const panchangItems = [
    { label: "Date", value: panchangData.date },
    { label: "Paksha", value: panchangData.paksha },
    { label: "Tithi", value: panchangData.tithi },
    { label: "Nakshatra", value: panchangData.nakshatra },
    { label: "Yoga", value: panchangData.yoga },
    { label: "Karana", value: panchangData.karana },
    { label: "Raasi", value: panchangData.raasi },
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
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3 text-sm">
              {panchangItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  className={`flex justify-between ${index < panchangItems.length - 1 ? "pb-3 border-b border-amber-200" : ""}`}
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