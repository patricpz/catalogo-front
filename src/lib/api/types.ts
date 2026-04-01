export type User = {
  id: string;
  email: string;
  createdAt: string;
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
