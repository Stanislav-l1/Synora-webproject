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
  id: string;
  projectId: string;
  name: string;
  position: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  assigneeUsername: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  columnId: string;
}
