"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function FloatingConsultationButton() {
  const scrollToConsultation = () => {
    const element = document.getElementById("consultation-packages");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.div 
      className="fixed bottom-[20vh] right-6 z-40"
      initial={{ opacity: 0, scale: 0.8, x: 50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      whileHover={{ scale: 1.1 }}
    >
      <Button
        onClick={scrollToConsultation}
        variant="primary"
        size="lg"
        className="shadow-2xl"
      >
        Book Consultation
      </Button>
    </motion.div>
  );
}
