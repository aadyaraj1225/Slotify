export type UserRole = "candidate" | "interviewer" | "coordinator";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarLetter: string;
  rollNo?: string;        // for candidates
  department?: string;    // for interviewers
  title?: string;         // for coordinators
}

export interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
