import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Terms of Service — Synora' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-primary px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-content-secondary hover:text-content-primary mb-8">
          <ArrowLeft size={14} /> Back
        </Link>
        <article className="prose prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-content-primary mb-2">Terms of Service</h1>
          <p className="text-sm text-content-tertiary mb-8">Last updated: May 12, 2026</p>

          <section className="space-y-6 text-content-secondary leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">1. Acceptance of Terms</h2>
              <p>By accessing or using Synora ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">2. Account Registration</h2>
              <p>You must be at least 13 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">3. User Content</h2>
              <p>You retain ownership of content you post on Synora. By posting, you grant us a non-exclusive, worldwide license to display and distribute your content within the Service. You are solely responsible for the legality of content you post.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">4. Prohibited Conduct</h2>
              <p>You agree not to: (a) post illegal, harmful, or harassing content; (b) impersonate others; (c) attempt to gain unauthorized access to the Service; (d) use automated scripts to scrape or spam; (e) distribute malware.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">5. Termination</h2>
              <p>We may suspend or terminate your account at any time for violations of these Terms. You may delete your account at any time via Settings.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">6. Disclaimer of Warranties</h2>
              <p>The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">7. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, Synora shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">8. Changes to Terms</h2>
              <p>We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">9. Contact</h2>
              <p>Questions about these Terms? Contact us at <a href="mailto:legal@synora.io" className="text-accent hover:underline">legal@synora.io</a>.</p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
