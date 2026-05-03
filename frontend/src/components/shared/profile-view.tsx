'use client';

import { useEffect, useState } from 'react';
import { MapPin, LinkIcon, Calendar, Star, Loader2, Github, Briefcase, BadgeCheck } from 'lucide-react';
import { VerificationBadge } from './verification-badge';
import type { VerificationType } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TabBar } from '@/components/ui/tab-bar';
import { PostCard } from '@/components/shared/post-card';
import { ProjectCard } from '@/components/shared/project-card';
import { RepoCard } from '@/components/shared/repo-card';
import { ContributionGraph } from '@/components/shared/contribution-graph';
import { EditProfileModal } from '@/components/shared/edit-profile-modal';
import { ShareProfileMenu } from '@/components/shared/share-profile-menu';
import { DashboardPanel } from '@/components/shared/dashboard-panel';
import { ProgressPanel } from '@/components/shared/progress-panel';
import { RecommendationsPanel } from '@/components/shared/recommendations-panel';
import { ReputationPanel } from '@/components/shared/reputation-panel';
import api from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import type { ApiResponse, PageResponse, UserProfile, GitRepository, ContributionData } from '@/types';

import type { PostSummary } from '@/types';

interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  starsCount: number;
  membersCount: number;
  tags: { id: number; name: string }[];
  createdAt: string;
}

interface FollowStats {
  followers: number;
  following: number;
}

interface ProfileViewProps {
  username: string;
  isOwn: boolean;
  locale?: 'ru' | 'en';
}

export function ProfileView({ username, isOwn, locale = 'en' }: ProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [repos, setRepos] = useState<GitRepository[]>([]);
  const [contributions, setContributions] = useState<ContributionData[]>([]);
  const [followStats, setFollowStats] = useState<FollowStats>({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(isOwn ? 'dashboard' : 'posts');
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    Promise.all([
      api.get<ApiResponse<UserProfile>>(`/users/${username}/profile`),
      api.get<ApiResponse<PageResponse<PostSummary>>>(`/posts/by/${username}?page=0&size=20`),
      api.get<ApiResponse<PageResponse<ProjectSummary>>>(`/projects/by/${username}?page=0&size=20`),
    ])
      .then(([profileRes, postsRes, projectsRes]) => {
        setProfile(profileRes.data.data);
        setPosts(postsRes.data.data.content);
        setProjects(projectsRes.data.data.content);
        const uid = profileRes.data.data.id;
        return Promise.all([
          api.get<ApiResponse<FollowStats>>(`/users/${uid}/follow-stats`),
          api.get<ApiResponse<GitRepository[]>>(`/users/${uid}/repos`).catch(() => ({ data: { data: [] } })),
          api.get<ApiResponse<ContributionData[]>>(`/users/${uid}/contributions`).catch(() => ({ data: { data: [] } })),
        ]);
      })
      .then(([statsRes, reposRes, contribRes]) => {
        setFollowStats(statsRes.data.data);
        setRepos(reposRes.data.data ?? []);
        setContributions(contribRes.data.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 size={28} className="animate-spin text-tyrian/60" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-24 text-cloud-muted text-sm">User not found</div>;
  }

  const displayName = profile.displayName || profile.username;
  const handle = `@${profile.username}`;
  const skills = profile.skills ?? [];
  const tabs = [
    ...(isOwn ? [{ id: 'dashboard', label: 'Dashboard' }] : []),
    { id: 'posts', label: 'Posts' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'projects', label: 'Projects' },
    { id: 'repos', label: 'Repos', count: repos.length },
    { id: 'reputation', label: 'Reputation' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-br from-tyrian via-tyrian-glow to-moss-velvet relative">
        <div className="absolute inset-0 bg-gradient-to-t from-cloud/60 to-transparent" />
      </div>

      {/* Header */}
      <div className="px-6 relative">
        <div className="-mt-12 mb-4 flex items-end justify-between">
          <div className="ring-4 ring-cloud rounded-full">
            <Avatar name={displayName} src={profile.avatarUrl || undefined} size="xl" />
          </div>
          <div className="flex gap-2 mb-2">
            {isOwn ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                  Edit Profile
                </Button>
                <ShareProfileMenu
                  username={profile.username}
                  displayName={displayName}
                  canExport
                />
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm">Follow</Button>
                <ShareProfileMenu
                  username={profile.username}
                  displayName={displayName}
                />
              </>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-cloud-ink">{displayName}</h1>
            {profile.verified && profile.verificationType && (
              <VerificationBadge
                type={profile.verificationType as VerificationType}
                size="lg"
                showLabel
              />
            )}
            {profile.pronouns && (
              <span className="text-xs text-cloud-muted border border-cloud-deep rounded-full px-2 py-0.5">
                {profile.pronouns}
              </span>
            )}
          </div>
          <p className="text-sm text-cloud-ink/70">{handle}</p>

          {profile.headline && (
            <p className="text-sm font-medium text-tyrian mt-1">{profile.headline}</p>
          )}

          {profile.availableFor && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-1 text-xs rounded-full bg-moss-velvet/10 text-moss-velvet border border-moss-velvet/20">
              <Briefcase size={12} /> Available for {profile.availableFor}
            </div>
          )}

          {profile.bio && (
            <p className="text-sm text-cloud-ink mt-2 max-w-lg whitespace-pre-wrap">{profile.bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-cloud-muted">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {profile.location}
              </span>
            )}
            {profile.websiteUrl && (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-tyrian transition-colors"
              >
                <LinkIcon size={12} /> {profile.websiteUrl.replace(/^https?:\/\//, '')}
              </a>
            )}
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-tyrian transition-colors"
              >
                <Github size={12} /> GitHub
              </a>
            )}
            {profile.createdAt && (
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Joined{' '}
                {new Date(profile.createdAt).toLocaleDateString(
                  locale === 'ru' ? 'ru-RU' : 'en-US',
                  { month: 'long', year: 'numeric' }
                )}
              </span>
            )}
            <span className="flex items-center gap-1 text-banana-deep">
              <Star size={12} /> {profile.reputationScore.toLocaleString()} reputation
            </span>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="px-2 py-0.5 text-xs rounded-md bg-cloud-soft border border-cloud-deep text-cloud-ink"
                >
                  {s.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-6 mt-4 text-sm">
            <span>
              <strong className="text-cloud-ink">{posts.length}</strong>{' '}
              <span className="text-cloud-muted">posts</span>
            </span>
            <span>
              <strong className="text-cloud-ink">{followStats.followers.toLocaleString()}</strong>{' '}
              <span className="text-cloud-muted">followers</span>
            </span>
            <span>
              <strong className="text-cloud-ink">{followStats.following.toLocaleString()}</strong>{' '}
              <span className="text-cloud-muted">following</span>
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6">
        <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="px-6 py-6">
        {activeTab === 'dashboard' && isOwn && (
          <div className="space-y-4">
            <DashboardPanel userId={profile.id} />
            <RecommendationsPanel />
            <ProgressPanel userId={profile.id} />
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-4 max-w-feed">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-cloud-muted text-sm">No posts yet</div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUsername={isOwn ? username : null}
                  onChange={(next) => setPosts((ps) => ps.map((p) => (p.id === next.id ? next : p)))}
                  onRemove={(id) => setPosts((ps) => ps.filter((p) => p.id !== id))}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <PortfolioCard profile={profile} projects={projects} />
            <ProgressPanel userId={profile.id} />
          </div>
        )}

        {activeTab === 'repos' && (
          <div className="space-y-4">
            <ContributionGraph contributions={contributions} />
            {repos.length === 0 ? (
              <div className="text-center py-10 text-cloud-muted text-sm">No repositories showcased yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {repos.filter((r) => r.featured).concat(repos.filter((r) => !r.featured)).map((r) => (
                  <RepoCard key={r.id} repo={r} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reputation' && (
          <ReputationPanel userId={profile.id} isOwn={isOwn} />
        )}

        {activeTab === 'projects' && (
          <div>
            {projects.length === 0 ? (
              <div className="text-center py-12 text-cloud-muted text-sm">No projects yet</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    name={project.name}
                    description={project.description || ''}
                    tags={project.tags?.map((t) => t.name)}
                    members={project.membersCount}
                    stars={project.starsCount}
                    progress={0}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isOwn && (
        <EditProfileModal
          open={editOpen}
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={(p) => setProfile(p)}
        />
      )}
    </div>
  );
}

function PortfolioCard({
  profile,
  projects,
}: {
  profile: UserProfile;
  projects: ProjectSummary[];
}) {
  const topProjects = projects.slice(0, 3);
  const skills = profile.skills ?? [];
  return (
    <div className="max-w-3xl">
      <div className="rounded-xl border border-cloud-deep bg-gradient-to-br from-white to-cloud-soft p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-cloud-muted">
              Professional card
            </p>
            <h2 className="text-xl font-bold text-cloud-ink mt-1">
              {profile.displayName || profile.username}
            </h2>
            {profile.headline && (
              <p className="text-sm text-tyrian font-medium">{profile.headline}</p>
            )}
            {profile.availableFor && (
              <p className="text-xs text-moss-velvet mt-1">
                Available for {profile.availableFor}
              </p>
            )}
          </div>
          <div className="text-right text-xs text-cloud-muted">
            <div>@{profile.username}</div>
            {profile.location && <div>{profile.location}</div>}
            <div className="mt-1 text-banana-deep">
              {profile.reputationScore.toLocaleString()} rep
            </div>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-cloud-muted mb-1.5">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="px-2 py-0.5 text-xs rounded-md bg-white border border-cloud-deep text-cloud-ink"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.bio && (
          <p className="text-sm text-cloud-ink/80 mt-4 whitespace-pre-wrap">{profile.bio}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {profile.websiteUrl && (
            <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer"
              className="text-tyrian hover:underline">Website</a>
          )}
          {profile.githubUrl && (
            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
              className="text-tyrian hover:underline">GitHub</a>
          )}
        </div>
      </div>

      {topProjects.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-cloud-ink mb-3">Featured projects</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topProjects.map((p) => (
              <ProjectCard
                key={p.id}
                id={p.id}
                name={p.name}
                description={p.description || ''}
                tags={p.tags?.map((t) => t.name)}
                members={p.membersCount}
                stars={p.starsCount}
                progress={0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
