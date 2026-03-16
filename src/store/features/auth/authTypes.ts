import { MockUser } from "@/data/mockUser";

export interface AuthState {
  user: MockUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}