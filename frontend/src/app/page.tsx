import {
  LandingNavbar,
  HeroSection,
  FeaturesGrid,
  FeedPreview,
  CommunitySection,
  FAQSection,
  CTASection,
  LandingFooter,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="bg-retro-bg text-retro-text min-h-screen overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <div className="relative h-12">
        <div className="ribbon w-[40%] top-1/2 left-[30%] -translate-y-1/2" />
      </div>
      <FeedPreview />
      <FeaturesGrid />
      <CommunitySection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
