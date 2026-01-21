import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-amber-lightest/80 backdrop-blur-md border-b border-amber-light shadow-sm">
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
          <div className="text-right">
            <div className="text-base font-semibold text-gray-800">Pandit Sharma</div>
            <div className="text-xs text-amber-ink font-semibold">Vedic Astrologer</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-light to-amber-medium flex items-center justify-center text-white text-outline-black font-bold shadow-md">
            PS
          </div>
        </div>
      </div>
    </header>
  );
}
