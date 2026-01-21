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

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-gray-900">Today's Panchang</h3>
      <div className="bg-gradient-to-br from-amber-lightest to-amber-lighter rounded-2xl p-6 space-y-4 border border-amber-light shadow-lg">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between pb-3 border-b border-amber-light">
            <span className="text-gray-600 font-medium">Date</span>
            <span className="text-gray-900 font-semibold">{panchangData.date}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-amber-light">
            <span className="text-gray-600 font-medium">Tithi</span>
            <span className="text-gray-900 font-semibold">{panchangData.tithi}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-amber-light">
            <span className="text-gray-600 font-medium">Nakshatra</span>
            <span className="text-gray-900 font-semibold">{panchangData.nakshatra}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-amber-light">
            <span className="text-gray-600 font-medium">Yoga</span>
            <span className="text-gray-900 font-semibold">{panchangData.yoga}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-amber-light">
            <span className="text-gray-600 font-medium">Karana</span>
            <span className="text-gray-900 font-semibold">{panchangData.karana}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Sunrise</span>
            <span className="text-gray-900 font-semibold">{panchangData.sunrise}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Sunset</span>
            <span className="text-gray-900 font-semibold">{panchangData.sunset}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
