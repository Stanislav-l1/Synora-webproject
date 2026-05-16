import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Privacy Policy — Synora' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-primary px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-content-secondary hover:text-content-primary mb-8">
          <ArrowLeft size={14} /> Back
        </Link>
        <article className="prose prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-content-primary mb-2">Privacy Policy</h1>
          <p className="text-sm text-content-tertiary mb-8">Last updated: May 12, 2026</p>

          <section className="space-y-6 text-content-secondary leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">1. Information We Collect</h2>
              <p>We collect the following data when you use Synora:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong className="text-content-primary">Account data:</strong> username, email, password (hashed), display name</li>
                <li><strong className="text-content-primary">Profile data:</strong> bio, avatar, location, skills, social links you choose to share</li>
                <li><strong className="text-content-primary">User content:</strong> posts, comments, projects, messages</li>
                <li><strong className="text-content-primary">Usage data:</strong> IP address, browser type, pages visited, timestamps</li>
                <li><strong className="text-content-primary">OAuth data:</strong> if you sign in via GitHub, we receive your public profile and email</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">2. How We Use Your Data</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>To provide and operate the Service</li>
                <li>To authenticate you and secure your account</li>
                <li>To send transactional emails (verification, password reset)</li>
                <li>To detect abuse, fraud, and violations of our Terms</li>
                <li>To improve the Service through aggregated analytics</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">3. Data Sharing</h2>
              <p>We do not sell your personal data. We share data only with:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Service providers (email delivery, hosting) under strict confidentiality</li>
                <li>Law enforcement if required by valid legal process</li>
                <li>Other users — only the profile data and content you choose to make public</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">4. Cookies & Tracking</h2>
              <p>We use essential cookies and localStorage to keep you logged in (JWT tokens). We do not use third-party advertising trackers.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">5. Data Retention</h2>
              <p>We retain your account data while your account is active. When you delete your account, we permanently remove your personal data within 30 days, except where retention is legally required.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">6. Your Rights (GDPR)</h2>
              <p>If you are in the EU/EEA, you have the right to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Request correction or deletion</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent for processing</li>
                <li>Lodge a complaint with your local data protection authority</li>
              </ul>
              <p className="mt-2">To exercise these rights, contact <a href="mailto:privacy@synora.io" className="text-accent hover:underline">privacy@synora.io</a>.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">7. Security</h2>
              <p>We use BCrypt for password hashing, HTTPS for all connections, and JWT-based stateless authentication. While we apply industry best practices, no system is 100% secure.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">8. Children</h2>
              <p>Synora is not intended for children under 13. We do not knowingly collect data from children under 13. If you believe a child has provided us data, contact us and we will delete it.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">9. Changes to This Policy</h2>
              <p>We will notify users of material changes via email or in-app notification at least 14 days before they take effect.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-content-primary mb-2">10. Contact</h2>
              <p>Data Protection Officer: <a href="mailto:privacy@synora.io" className="text-accent hover:underline">privacy@synora.io</a></p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
