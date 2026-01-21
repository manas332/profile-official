import Button from "@/components/ui/Button";

export default function CTASection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="bg-linear-to-r from-amber-light to-amber-medium rounded-3xl p-12 text-center text-white text-outline-black-all shadow-2xl">
        <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Life?</h2>
        <p className="text-xl mb-8 text-white/90">Get personalized astrological guidance tailored to your birth chart</p>
        <Button variant="secondary" size="lg">
          Book a Consultation
        </Button>
      </div>
    </section>
  );
}
