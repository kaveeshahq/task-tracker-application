export type Role = "USER" | "ADMIN";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskOwner {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate?: string | null;
  ownerId: string;
  owner?: TaskOwner;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface TaskListResponse {
  success: boolean;
  data: Task[];
  pagination: Pagination;
}

export interface TaskResponse {
  success: boolean;
  message?: string;
  data: Task;
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  ownerId?: string;
}