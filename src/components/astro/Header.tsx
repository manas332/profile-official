"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { signOut } = useAuth();

  const scrollToConsultation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById("consultation-packages");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.header
      className="sticky top-0 z-50 bg-amber-lightest/80 backdrop-blur-md border-b border-amber-light shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/hp_logo.png"
            alt="HP Logo"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right flex flex-col items-end gap-1">
            <div className="text-base font-semibold text-gray-800">Pandit Sharma</div>
            <a
              href="#consultation-packages"
              onClick={scrollToConsultation}
              className="px-2 py-1 text-[10px] leading-tight text-amber-ink hover:text-amber-medium underline font-semibold transition-colors"
            >
              Book Consultation
            </a>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-light to-amber-medium flex items-center justify-center text-white text-outline-black font-bold shadow-md">
              PS
            </div>
            <button
              onClick={signOut}
              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
