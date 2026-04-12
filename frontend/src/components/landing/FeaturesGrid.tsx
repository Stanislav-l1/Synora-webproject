import { GitBranch, MessageSquare, Users, Calendar } from 'lucide-react';
import { FeatureCard } from './FeatureCard';
import { ScrollReveal } from './ScrollReveal';

const features = [
  {
    icon: <GitBranch size={24} />,
    title: 'Build in the open',
    description:
      'Create projects with kanban boards, tasks, and progress tracking. Collaborate with your team in real time — like GitHub, but simpler.',
  },
  {
    icon: <MessageSquare size={24} />,
    title: 'Share your journey',
    description:
      'Post updates, discuss ideas, and celebrate wins. A social feed built for developers — not influencers.',
  },
  {
    icon: <Users size={24} />,
    title: 'Find your tribe',
    description:
      'Create and join topic-based communities. Share knowledge, mentor newcomers, and grow together.',
  },
  {
    icon: <Calendar size={24} />,
    title: 'Learn together',
    description:
      'Organize conferences, workshops, and meetups. Schedule events, stream talks, and build a learning culture.',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="bg-retro-bg py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-retro-ink mb-4">
            Everything you need,{' '}
            <span className="italic text-retro-accent">one platform</span>
          </h2>
          <p className="text-retro-text-muted text-lg max-w-2xl mx-auto">
            Stop switching between GitHub, Slack, Discord, and Eventbrite. Synora brings it all together.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
