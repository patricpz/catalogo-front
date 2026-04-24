import { Store } from "./stores";

export type User = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  password: string;
  store?: Store;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  expiresIn: string;
};

export type ApiErrorBody = {
  message?: string;
  code?: string;
  issues?: unknown;
};
