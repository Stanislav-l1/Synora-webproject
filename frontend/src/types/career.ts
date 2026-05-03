export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'FREELANCE' | 'CO_FOUNDER' | 'TEAM_MEMBER';
export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT';
export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';

export interface JobPosting {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
  projectId: string | null;
  title: string;
  description: string;
  company: string | null;
  location: string | null;
  remote: boolean;
  type: JobType;
  status: JobStatus;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  experienceYears: number | null;
  applicationUrl: string | null;
  applicationsCount: number;
  viewsCount: number;
  skills: string[];
  applied: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantUsername: string;
  applicantDisplayName: string | null;
  applicantAvatarUrl: string | null;
  coverLetter: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  CO_FOUNDER: 'Co-founder',
  TEAM_MEMBER: 'Team Member',
};

export const JOB_TYPE_COLORS: Record<JobType, string> = {
  FULL_TIME: 'bg-accent/20 text-accent',
  PART_TIME: 'bg-info/20 text-info',
  INTERNSHIP: 'bg-success/20 text-success',
  FREELANCE: 'bg-warning/20 text-warning',
  CO_FOUNDER: 'bg-danger/20 text-danger',
  TEAM_MEMBER: 'bg-content-secondary/20 text-content-secondary',
};
