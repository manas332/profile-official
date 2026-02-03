"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function Header() {
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const initGoogleTranslate = () => {
      const target = document.getElementById("google_translate_element");
      if (target && target.innerHTML === "") {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,mr,bn,pa,gu,ta,te,kn,ml",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    if (window.google && window.google.translate) {
      initGoogleTranslate();
    } else {
      // Check if script is already present to prevent duplicates
      const existingScript = document.getElementById("google-translate-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
        window.googleTranslateElementInit = initGoogleTranslate;
      } else {
        // Script exists but google.translate isn't ready yet? 
        // It should eventually fire the callback we assigned (if we were the ones who assigned it),
        // or we can poll/wait. But usually if script is there, we assume it loaded or will callback.
        // For safety, re-assign the callback if it hasn't fired.
        window.googleTranslateElementInit = initGoogleTranslate;
      }
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Services", href: "#consultation-packages" },
    { name: "Products", href: "#products" },
    { name: "About", href: "#about" },
  ];

  return (
    <motion.header
      className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/hp_logo.png"
            alt="HP Logo"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-800 hover:text-amber-600 font-medium transition-colors"
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={signOut}
            className="px-4 py-1.5 text-sm bg-red-50 text-red-600 border border-red-100 rounded-full hover:bg-red-100 transition-colors font-medium ml-4"
          >
            Logout
          </button>
        </nav>

        {/* Right Side: Language & Mobile Toggle */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div id="google_translate_element" className="google-translate-container"></div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-800 hover:text-amber-600 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-white/20"
          >
            <div className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-800 hover:text-amber-600 font-medium transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-gray-200" />
              <button
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        /* Hide Google Translate top bar */
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        body {
          top: 0px !important;
        }

        /* Container adjustment */
        .google-translate-container {
             line-height: normal;
             display: flex;
             align-items: center;
        }

        /* Clean up the gadget */
        .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
          padding: 0 !important;
          font-family: inherit !important;
          font-size: 14px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
        }

        /* Text styling - Ensure it is visible! */
        .goog-te-gadget-simple span {
          color: #1f2937 !important;
          font-weight: 500 !important;
          display: inline-block !important; /* Ensure visibility */
        }
        
        .goog-te-gadget-simple span:hover {
          color: #d97706 !important;
        }

        /* Hide the Google icon explicitly */
        .goog-te-gadget-icon, 
        .goog-te-gadget-simple img {
          display: none !important;
        }
        
        /* Dropdown arrow styling */
        .goog-te-gadget-simple .goog-te-menu-value {
          margin: 0 0 0 4px !important;
          display: flex !important;
          align-items: center !important;
        }
        
        /* Hide the pipe | if it exists */
        .goog-te-gadget-simple .goog-te-menu-value span[style*="border-left"] {
            display: none !important;
        }
         
        /* Force show the arrow */
        .goog-te-gadget-simple .goog-te-menu-value:after {
            content: '▼';
            font-size: 10px;
            margin-left: 4px;
            color: #1f2937;
        }
      `}</style>
    </motion.header>
  );
}
