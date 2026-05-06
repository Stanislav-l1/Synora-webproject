import {
  LandingNavbar,
  HeroSection,
  TrustSection,
  FeaturesGrid,
  FeedPreview,
  UseCasesSection,
  TestimonialsSection,
  ComparisonSection,
  LandingPricingSection,
  FAQSection,
  CTASection,
  LandingFooter,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="bg-retro-bg text-retro-text min-h-screen overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <TrustSection />
      <FeaturesGrid />
      <FeedPreview />
      <UseCasesSection />
      <TestimonialsSection />
      <ComparisonSection />
      <LandingPricingSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
