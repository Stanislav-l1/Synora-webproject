import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const mockPosts = [
  {
    author: 'Maria Chen',
    handle: '@mariachen',
    avatar: 'MC',
    avatarColor: 'bg-rose-100 text-rose-600',
    time: '2h ago',
    content:
      'Just open-sourced our internal design system built with Tailwind + Radix. 40+ components, fully accessible. Check it out!',
    tags: ['opensource', 'design-system'],
    likes: 128,
    comments: 23,
  },
  {
    author: 'Dev Patel',
    handle: '@devpatel',
    avatar: 'DP',
    avatarColor: 'bg-blue-100 text-blue-600',
    time: '5h ago',
    content:
      'TIL: You can use Rust\'s pattern matching to handle 15 error variants in a single match block. Clean, readable, no more nested ifs.',
    tags: ['rust', 'til'],
    likes: 94,
    comments: 17,
  },
  {
    author: 'Sophie Kuznetsova',
    handle: '@sophiek',
    avatar: 'SK',
    avatarColor: 'bg-emerald-100 text-emerald-600',
    time: '8h ago',
    content:
      'Our team just shipped real-time collaboration for our kanban boards. WebSockets + CRDT = magic. Wrote a deep-dive blog post about the architecture.',
    tags: ['webdev', 'architecture'],
    likes: 256,
    comments: 41,
  },
];

export function FeedPreview() {
  return (
    <section id="feed" className="bg-retro-bg-alt py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-retro-ink mb-4">
            See what developers are{' '}
            <span className="italic text-retro-accent">talking about</span>
          </h2>
          <p className="text-retro-text-muted text-lg">
            A feed built for sharing knowledge, not chasing likes.
          </p>
        </ScrollReveal>

        <div className="space-y-4">
          {mockPosts.map((post, i) => (
            <ScrollReveal key={post.handle} delay={i * 0.12}>
              <article className="retro-card p-5">
                {/* Author */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-full ${post.avatarColor} flex items-center justify-center text-sm font-semibold shrink-0`}
                  >
                    {post.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-retro-text">{post.author}</p>
                    <p className="text-xs text-retro-text-muted">
                      {post.handle} · {post.time}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-retro-text leading-relaxed mb-3">
                  {post.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-retro-bg-alt text-retro-text-muted border border-retro-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 text-retro-text-muted">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Heart size={14} /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <MessageCircle size={14} /> {post.comments}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <Bookmark size={14} />
                  </span>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.4} className="text-center mt-8">
          <a
            href="/register"
            className="text-retro-accent hover:text-retro-accent-hover text-sm font-medium transition-colors"
          >
            Join to see more from the community &rarr;
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
