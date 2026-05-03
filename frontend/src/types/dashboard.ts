import type { TaskStatus, TaskPriority } from './project';

export interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string | null;
  projectName: string | null;
}

export interface CurrentProject {
  id: string;
  name: string;
  role: string;
  membersCount: number;
  starsCount: number;
  updatedAt: string | null;
}

export interface ActivitySummary {
  postsThisWeek: number;
  reputationDeltaThisWeek: number;
  openTasks: number;
  upcomingDeadlines: number;
  currentProjects: number;
  unreadMessages: number;
  upcomingTasks: UpcomingTask[];
  currentProjectsList: CurrentProject[];
}
