export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerUsername: string;
  isPublic: boolean;
  membersCount: number;
  starsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface ProjectMember {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: ProjectRole;
  joinedAt: string;
}

export interface KanbanColumn {
  id: number;
  name: string;
  color: string | null;
  orderIndex: number;
  wipLimit: number | null;
  tasks: Task[];
}

export interface KanbanBoardResponse {
  projectId: string;
  projectName: string;
  columns: KanbanColumn[];
}

export interface Task {
  id: string;
  projectId: string;
  columnId: number;
  title: string;
  description: string | null;
  status: string;
  priority: TaskPriority;
  assigneeUsername: string | null;
  assigneeDisplayName: string | null;
  assigneeAvatarUrl: string | null;
  reporterUsername: string | null;
  orderIndex: number;
  dueDate: string | null;
  storyPoints: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  columnId: number;
}
