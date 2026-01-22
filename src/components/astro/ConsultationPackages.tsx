
"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

interface Package {
  duration: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const packages: Package[] = [
  {
    duration: "15 Minutes",
    title: "Quick Session",
    price: "₹999",
    description: "Ideal for 1 quick question and direction.",
    features: ["Quick Question", "Basic Guidance"],
  },
  {
    duration: "30 Minutes",
    title: "Standard Session",
    price: "₹1,999",
    description: "Detailed guidance with kundli-based insights.",
    features: ["Detailed Analysis", "Kundli Reading", "Remedy Suggestions"],
    popular: true,
  },
  {
    duration: "60 Minutes",
    title: "Premium Session",
    price: "₹3,499",
    description: "Complete, in-depth analysis with remedies.",
    features: ["Complete Kundli Analysis", "Gemstone Consultation", "Detailed Remedies"],
  },
];

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

export default function ConsultationPackages() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <section id="consultation-packages" className="max-w-7xl mx-auto px-6 pt-8 pb-8">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Consultation Packages</h2>
        <p className="text-xl text-gray-600">Choose the session duration that works best for you</p>
      </motion.div>

      {isDesktop ? (
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              className={`bg-white rounded-2xl p-8 border-2 ${
                pkg.popular
                  ? "bg-linear-to-br from-amber-light to-amber-medium text-white text-outline-black-all shadow-2xl relative"
                  : "border-amber-light shadow-lg"
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              {pkg.popular && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-medium-dark text-white text-outline-black px-6 py-1 rounded-full text-sm font-semibold z-20 shadow-md">
                  Most Popular
                </div>
              )}
              <div className="text-center space-y-5">
                <div>
                  <h3 className={`text-2xl font-bold mb-1 ${pkg.popular ? "" : "text-gray-900"}`}>
                    {pkg.title}
                  </h3>
                  <p className={`${pkg.popular ? "text-white/90" : "text-gray-600"}`}>{pkg.duration}</p>
                  <p className={`mt-3 text-4xl font-extrabold ${pkg.popular ? "" : "text-amber-ink"}`}>
                    {pkg.price}
                  </p>
                </div>

                <p className={`${pkg.popular ? "text-white/90" : "text-gray-700"}`}>
                  {pkg.description}
                </p>

                <ul className={`space-y-2 text-left ${pkg.popular ? "text-white/90" : "text-gray-700"}`}>
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <svg
                        className={`w-5 h-5 ${pkg.popular ? "text-white" : "text-green-600"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button variant={pkg.popular ? "secondary" : "primary"} className="w-full">
                  Select Plan
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {packages.map((pkg, index) => (
            <motion.details
              key={index}
              className={`group bg-white rounded-2xl border-2 overflow-hidden mx-auto w-full max-w-sm ${
                pkg.popular
                  ? "bg-linear-to-br from-amber-light to-amber-medium text-white text-outline-black-all shadow-2xl relative"
                  : "border-amber-light shadow-lg"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {pkg.popular && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-medium-dark text-white text-outline-black px-6 py-1 rounded-full text-sm font-semibold z-20 shadow-md">
                  Most Popular
                </div>
              )}
              <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                <div className="p-4 pt-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-left space-y-1">
                      <p className={`text-xs font-semibold ${pkg.popular ? "text-white/90" : "text-gray-600"}`}>
                        {pkg.duration}
                      </p>
                      <h3 className={`text-lg font-bold leading-snug ${pkg.popular ? "" : "text-gray-900"}`}>
                        {pkg.title}
                      </h3>
                    </div>

                    <div className="shrink-0 text-right space-y-2">
                      <p className={`text-2xl font-extrabold tracking-tight ${pkg.popular ? "" : "text-amber-ink"}`}>
                        {pkg.price}
                      </p>
                      <div
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                          pkg.popular ? "bg-white/15 text-white" : "bg-amber-lightest text-amber-ink"
                        }`}
                      >
                        Tap for details
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4 transition-transform group-open:rotate-180"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </summary>

              <div className={`px-4 pb-4 ${pkg.popular ? "text-white/90" : "text-gray-700"}`}>
                <p className="text-sm leading-relaxed mb-3">{pkg.description}</p>
                <ul className="space-y-2 text-left">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <svg
                        className={`w-4 h-4 ${pkg.popular ? "text-white" : "text-green-600"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  <Button variant={pkg.popular ? "secondary" : "primary"} className="w-full">
                    Select Plan
                  </Button>
                </div>
              </div>
            </motion.details>
          ))}
        </div>
      )}
    </section>
  );
}
