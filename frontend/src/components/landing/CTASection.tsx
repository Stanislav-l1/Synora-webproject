import Link from 'next/link';
import { ScrollReveal } from './ScrollReveal';

export function CTASection() {
  return (
    <section className="bg-retro-ink py-24 px-6">
      <ScrollReveal className="max-w-3xl mx-auto text-center">
        <h2 className="font-serif text-4xl md:text-5xl text-retro-bg mb-4">
          Ready to join the community?
        </h2>
        <p className="text-retro-bg/60 text-lg mb-10 max-w-xl mx-auto">
          Start building projects, connecting with developers, and growing your skills today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-retro-accent hover:bg-retro-accent-hover text-white font-medium px-8 py-3 rounded-full text-base transition-colors"
          >
            Create your account
          </Link>
          <Link
            href="/login"
            className="text-retro-bg/60 hover:text-retro-bg text-sm font-medium transition-colors"
          >
            Already have an account? Sign in &rarr;
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
