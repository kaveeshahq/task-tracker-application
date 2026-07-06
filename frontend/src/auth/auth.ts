import client from "../api/client";
import type { AuthResponse, User } from "../types";

export const registerRequest = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await client.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
  });
  return res.data;
};

export const loginRequest = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await client.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return res.data;
};

export const meRequest = async (): Promise<User> => {
  const res = await client.get<{ success: boolean; data: User }>("/auth/me");
  return res.data.data;
};