import {
  LandingNavbar,
  HeroSection,
  FeaturesGrid,
  FeedPreview,
  CommunitySection,
  CTASection,
  LandingFooter,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="bg-retro-bg text-retro-text min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <FeedPreview />
      <FeaturesGrid />
      <CommunitySection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
