'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useLocale, useT } from '@/lib/i18n';

type FaqItem = { q: string; a: string };
type FaqCategory = { id: string; title: string; items: FaqItem[] };

const CATEGORIES_EN: FaqCategory[] = [
  {
    id: 'platform',
    title: 'About the platform',
    items: [
      {
        q: 'What is Synora?',
        a: 'Synora is a hybrid platform for developers — combining project collaboration (like GitHub), a social feed (like Dev.to), realtime chat (like Slack), and learning communities (like ВК-style spaces). Everything lives in one place: your code, your conversations, and your growth.',
      },
      {
        q: 'Who is Synora for?',
        a: 'Developers at any stage — students learning to code, indie hackers shipping side projects, open-source maintainers, IT communities running courses, and teams who want lightweight project management without enterprise bloat.',
      },
      {
        q: 'Is Synora free to use?',
        a: 'Yes — the core platform is free forever: profiles, projects, chats, posts, communities. Paid tiers unlock larger storage, advanced analytics, and tools for community admins running courses at scale.',
      },
      {
        q: 'Can I use Synora in my native language?',
        a: 'The interface is currently available in English and Russian, with more locales planned. Content is unrestricted — write posts and run courses in any language.',
      },
    ],
  },
  {
    id: 'projects',
    title: 'Projects & collaboration',
    items: [
      {
        q: 'How do projects work?',
        a: 'Each project has a kanban board, tasks, members with roles (owner / maintainer / member / viewer), tags, a built-in chat, and stars. You can keep it private to your team or publish it to the public feed.',
      },
      {
        q: 'How is this different from GitHub?',
        a: 'Synora projects focus on the human side of building — discussion, planning, members, learning. Code itself stays in your existing Git host (GitHub, GitLab, self-hosted). We link to it; we don\'t replace it.',
      },
      {
        q: 'Can I invite teammates who aren\'t on Synora yet?',
        a: 'Yes. Use invite links from any project — recipients land on a preview page, can accept, and join after a quick sign-up. Roles are picked up automatically from the invite.',
      },
      {
        q: 'How do I track progress?',
        a: 'Tasks have status, priority, assignees, due dates, and story points. Your dashboard surfaces upcoming deadlines, overdue work, and active projects — across every team you belong to.',
      },
    ],
  },
  {
    id: 'communities',
    title: 'Communities',
    items: [
      {
        q: 'What is a community on Synora?',
        a: 'A space owned by a group — for example a university CS club, a regional dev meetup, or an OSS project\'s contributor circle. Communities have their own feed, members, events, and (optionally) courses.',
      },
      {
        q: 'How do I create or join one?',
        a: 'Anyone can create a community from the Communities page. Joining is one click — public communities are open, private ones require approval from a moderator.',
      },
      {
        q: 'Can I run events from a community?',
        a: 'Yes. Use the calendar to schedule meetups, talks, workshops, AMAs. Members get notified, RSVP, and the event surfaces in the community feed and on personal calendars.',
      },
    ],
  },
  {
    id: 'ai',
    title: 'AI Assistant',
    items: [
      {
        q: 'What does the AI Assistant do?',
        a: 'It helps you draft posts, summarize long threads, suggest tags, answer questions about projects you\'re a member of, and surface insights on your dashboard ("you haven\'t posted this week", "3 tasks are overdue").',
      },
      {
        q: 'Does the AI read my private content?',
        a: 'Only the content you explicitly share with it inside a chat session, and only your own data — your posts, your tasks, your messages. It never trains on your data and never sees other users\' private content.',
      },
      {
        q: 'Which model powers it?',
        a: 'We use Anthropic\'s Claude family for generation and reasoning. The exact model rotates with the latest stable release.',
      },
    ],
  },
  {
    id: 'courses',
    title: 'Courses & learning',
    items: [
      {
        q: 'What can I do with courses?',
        a: 'Communities can publish full courses — modules, lessons (text / video / interactive), assignments, and progress tracking. Students enroll, learn at their pace, and discuss in the community feed.',
      },
      {
        q: 'Can I sell my course?',
        a: 'Yes — paid courses are supported via Synora\'s subscriptions and one-time purchases. Synora handles billing; the community keeps the majority of revenue.',
      },
      {
        q: 'Do students get certificates?',
        a: 'Course authors can issue verifiable certificates of completion that show up on the student\'s profile and can be shared externally.',
      },
    ],
  },
  {
    id: 'reputation',
    title: 'Reputation',
    items: [
      {
        q: 'How does reputation work?',
        a: 'You earn points for valuable activity — getting likes on a post, having a comment marked helpful, completing a project task, mentoring someone, or hitting milestones. Points unlock career levels: Newcomer → Contributor → Active → Maintainer → Expert → Master.',
      },
      {
        q: 'What about achievements?',
        a: 'Achievements are one-off badges (first post, ten followers, first project, 1k reputation, etc.) that pin to your profile. They\'re cosmetic but visible — a quick way for others to read your history.',
      },
      {
        q: 'Can reputation be lost?',
        a: 'Most points are permanent. Reputation can only decrease through moderation actions (e.g. a deleted post that violated community rules).',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & privacy',
    items: [
      {
        q: 'How is my data protected?',
        a: 'All traffic is HTTPS-only. Passwords are stored as bcrypt hashes (strength 12). Auth uses short-lived JWT access tokens (15 min) with rotating refresh tokens (7 days). Sessions are revocable from your settings.',
      },
      {
        q: 'Can I delete my account and data?',
        a: 'Yes. Account deletion is self-service from settings — your profile, posts, and messages are permanently removed within 30 days. Anonymized contributions to public threads are kept where required to preserve conversation context.',
      },
      {
        q: 'Do you support 2FA?',
        a: 'Two-factor auth via TOTP and security keys (WebAuthn) is on the near-term roadmap. GitHub and Google OAuth are available today as a strong alternative.',
      },
      {
        q: 'How do you handle abuse?',
        a: 'Every post, comment, and profile has a Report button. Reports go to a moderation queue handled by community admins or platform staff for cross-community issues. Repeat offenders are rate-limited or banned.',
      },
    ],
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions & pricing',
    items: [
      {
        q: 'What\'s in the free tier?',
        a: 'Unlimited public projects, unlimited posts, unlimited 1:1 and group chats, community membership, full access to public courses, basic AI Assistant usage.',
      },
      {
        q: 'What do paid tiers add?',
        a: 'Pro: more storage, larger AI Assistant context, advanced profile analytics. Team: shared billing, private communities at scale, audit logs. Community: revenue tools, course analytics, custom branding.',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes — cancel from the billing page. Your tier stays active until the end of the current period; no prorated refunds, no questions asked.',
      },
    ],
  },
  {
    id: 'monetization',
    title: 'Monetization for creators',
    items: [
      {
        q: 'How do I make money on Synora?',
        a: 'Three ways today: paid courses, paid community memberships, and tip jars on your profile. Sponsorships and creator marketplaces are on the roadmap.',
      },
      {
        q: 'What\'s the platform fee?',
        a: 'Synora keeps a small platform fee on paid transactions to cover billing and infrastructure. Creators receive the majority share — exact percentages are listed on the billing page.',
      },
      {
        q: 'How and when do I get paid?',
        a: 'Payouts run monthly to a connected bank or payment account, in the currency you choose. Minimum payout threshold and supported countries are documented in settings.',
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    items: [
      {
        q: 'Which integrations are supported?',
        a: 'GitHub (link repos to projects, sync issues), Google / GitHub OAuth for sign-in, S3-compatible storage for files, calendar export (.ics). Slack, Discord, GitLab, and Linear are planned.',
      },
      {
        q: 'Is there a public API?',
        a: 'Yes — every endpoint the web app uses is part of a documented REST API (Swagger UI is published at /api-docs). Personal access tokens are coming so you can script against your own data.',
      },
      {
        q: 'Can I self-host Synora?',
        a: 'The codebase is built to run as Docker Compose (Postgres + Redis + MinIO + backend + frontend + nginx). A self-host guide is in the roadmap; for now, see the README in the repo.',
      },
    ],
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    items: [
      {
        q: 'What\'s shipping next?',
        a: 'Expanded AI Assistant (project-aware Q&A, proactive insights), course platform v1, mobile apps (iOS + Android), 2FA, payouts in more currencies, public marketplace for templates and snippets.',
      },
      {
        q: 'How do I influence what gets built?',
        a: 'Vote on the public roadmap board, post feature requests with the #feature-request tag, or join the Synora community on the platform itself. Top-voted requests inform every quarterly plan.',
      },
      {
        q: 'How often do you ship?',
        a: 'Backend deploys weekly, frontend daily. Major features land monthly. Status and changelog are on the public roadmap page.',
      },
    ],
  },
];

const CATEGORIES_RU: FaqCategory[] = [
  {
    id: 'platform',
    title: 'О платформе',
    items: [
      { q: 'Что такое Synora?', a: 'Synora — гибридная платформа для разработчиков: проектная коллаборация (как GitHub), социальная лента (как Dev.to), realtime-чат (как Slack) и обучающие сообщества. Всё в одном месте: код, общение и рост.' },
      { q: 'Для кого Synora?', a: 'Для разработчиков любого уровня — студентов, инди-хакеров, мейнтейнеров open-source, IT-сообществ с курсами и команд, которым нужен простой проектный менеджмент без корпоративных инструментов.' },
      { q: 'Synora бесплатна?', a: 'Да — основная платформа бесплатна навсегда: профили, проекты, чаты, посты, сообщества. Платные тарифы открывают расширенное хранилище, аналитику и инструменты для организаторов курсов.' },
      { q: 'Можно использовать на русском?', a: 'Интерфейс доступен на русском и английском, другие языки в планах. Контент — без ограничений: пишите посты и ведите курсы на любом языке.' },
    ],
  },
  {
    id: 'projects',
    title: 'Проекты и коллаборация',
    items: [
      { q: 'Как работают проекты?', a: 'У каждого проекта есть канбан-доска, задачи, участники с ролями (владелец / мейнтейнер / участник / наблюдатель), теги, встроенный чат и звёзды. Проект можно сделать приватным или публичным.' },
      { q: 'Чем это отличается от GitHub?', a: 'Synora фокусируется на человеческой стороне разработки — обсуждениях, планировании, участниках, обучении. Код остаётся на вашем Git-хосте (GitHub, GitLab, self-hosted). Мы ссылаемся на него, а не заменяем.' },
      { q: 'Можно пригласить команду?', a: 'Да. Используйте пригласительные ссылки из любого проекта — получатель попадает на превью, принимает приглашение и присоединяется после быстрой регистрации. Роли назначаются автоматически.' },
    ],
  },
  {
    id: 'communities',
    title: 'Сообщества',
    items: [
      { q: 'Что такое сообщество?', a: 'Пространство, принадлежащее группе — например, университетскому CS-клубу, региональному митапу разработчиков или кружку контрибьюторов OSS-проекта. Есть своя лента, участники, ивенты и (опционально) курсы.' },
      { q: 'Как создать или вступить?', a: 'Любой может создать сообщество со страницы Сообщества. Вступление — один клик для открытых. Закрытые требуют одобрения модератора.' },
      { q: 'Можно проводить ивенты?', a: 'Да. Используйте календарь для митапов, докладов, воркшопов, AMA. Участники получают уведомления, регистрируются, ивент появляется в ленте сообщества и в личных календарях.' },
    ],
  },
  {
    id: 'security',
    title: 'Безопасность',
    items: [
      { q: 'Как защищены мои данные?', a: 'Весь трафик — только HTTPS. Пароли хранятся как bcrypt-хеши (сила 12). Аутентификация — JWT access tokens (15 мин) с ротацией refresh tokens (7 дней). Сессии можно отозвать из настроек.' },
      { q: 'Можно удалить аккаунт?', a: 'Да. Удаление аккаунта — самообслуживание из настроек. Профиль, посты и сообщения удаляются в течение 30 дней.' },
    ],
  },
  {
    id: 'subscriptions',
    title: 'Подписки и цены',
    items: [
      { q: 'Что входит в бесплатный тариф?', a: 'Неограниченные публичные проекты, посты, 1:1 и групповые чаты, участие в сообществах, полный доступ к публичным курсам, базовый AI-ассистент.' },
      { q: 'Можно отменить в любой момент?', a: 'Да — отмена из страницы биллинга. Тариф остаётся активным до конца текущего периода.' },
    ],
  },
  {
    id: 'roadmap',
    title: 'Планы',
    items: [
      { q: 'Что выходит следующим?', a: 'Расширенный AI-ассистент, платформа курсов v1, мобильные приложения (iOS + Android), 2FA, выплаты в большем количестве валют, публичный маркетплейс шаблонов.' },
      { q: 'Как влиять на то, что строится?', a: 'Голосуйте на публичном роадмап-борде, создавайте запросы с тегом #feature-request или присоединяйтесь к сообществу Synora на платформе.' },
    ],
  },
];

export function FAQSection() {
  const { locale } = useLocale();
  const t = useT();
  const categories = locale === 'ru' ? CATEGORIES_RU : CATEGORIES_EN;

  return (
    <section id="faq" className="bg-retro-bg-alt py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl text-retro-ink mb-4">
            {t.landing.faqHeadline}
          </h2>
          <p className="text-retro-text-muted text-lg">
            {t.landing.faqSubtitle}
          </p>
        </ScrollReveal>

        {/* Category nav */}
        <ScrollReveal className="mb-12">
          <nav className="flex flex-wrap gap-2 justify-center">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`#faq-${c.id}`}
                className="text-xs uppercase tracking-wide px-3 py-1.5 rounded-full border border-retro-ink/20 text-retro-ink hover:bg-retro-ink hover:text-retro-bg-alt transition-colors"
              >
                {c.title}
              </a>
            ))}
          </nav>
        </ScrollReveal>

        <div className="space-y-12">
          {categories.map((category, i) => (
            <ScrollReveal key={category.id} delay={Math.min(i * 0.05, 0.3)}>
              <FAQCategoryBlock category={category} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQCategoryBlock({ category }: { category: FaqCategory }) {
  return (
    <div id={`faq-${category.id}`} className="scroll-mt-24">
      <h3 className="font-serif text-2xl md:text-3xl text-retro-ink mb-4 border-b border-retro-ink/10 pb-2">
        {category.title}
      </h3>
      <ul className="divide-y divide-retro-ink/10">
        {category.items.map((item, idx) => (
          <FAQItem key={idx} item={item} />
        ))}
      </ul>
    </div>
  );
}

function FAQItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
        aria-expanded={open ? 'true' : 'false'}
      >
        <span className="text-base md:text-lg font-medium text-retro-ink group-hover:text-retro-accent transition-colors">
          {item.q}
        </span>
        <ChevronDown
          size={18}
          className={`mt-1 shrink-0 text-retro-text-muted transition-transform ${
            open ? 'rotate-180 text-retro-accent' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? 'grid-rows-[1fr] pb-4 opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-retro-text-muted leading-relaxed pr-8">{item.a}</p>
        </div>
      </div>
    </li>
  );
}
