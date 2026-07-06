import client from "./client";
import type {
  Task,
  TaskInput,
  TaskFilters,
  TaskListResponse,
  TaskResponse,
} from "../types";

export const getTasks = async (
  filters: TaskFilters = {}
): Promise<TaskListResponse> => {
  const res = await client.get<TaskListResponse>("/tasks", { params: filters });
  return res.data;
};

export const getTask = async (id: string): Promise<Task> => {
  const res = await client.get<TaskResponse>(`/tasks/${id}`);
  return res.data.data;
};

export const createTask = async (input: TaskInput): Promise<Task> => {
  const res = await client.post<TaskResponse>("/tasks", input);
  return res.data.data;
};

export const updateTask = async (
  id: string,
  input: Partial<TaskInput>
): Promise<Task> => {
  const res = await client.patch<TaskResponse>(`/tasks/${id}`, input);
  return res.data.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await client.delete(`/tasks/${id}`);
};