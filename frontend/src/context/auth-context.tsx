import * as React from "react";
import type { UserAccount, UserRole } from "@/types/auth";

export const DEMO_USERS: Record<UserRole, UserAccount> = {
  candidate: {
    id: "cand-1",
    name: "Aarav Patel",
    email: "aarav.patel@campus.edu",
    role: "candidate",
    avatarLetter: "A",
    rollNo: "CS21B042",
  },
  interviewer: {
    id: "int-1",
    name: "Dr. Vikram Sethi",
    email: "v.sethi@partner-tech.com",
    role: "interviewer",
    avatarLetter: "V",
    department: "Distributed Systems & Cloud Architecture",
  },
  coordinator: {
    id: "coord-1",
    name: "Prof. Ananya Sen",
    email: "placements@campus.edu",
    role: "coordinator",
    avatarLetter: "P",
    title: "Head Placement Coordinator",
  },
};

const AUTH_STORAGE_KEY = "slotify_auth_session_v1";

interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: UserRole) => void;
  logout: () => void;
  getDefaultDashboardRoute: (role: UserRole) => string;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const getDefaultDashboardRoute = (role: UserRole): string => {
    switch (role) {
      case "candidate":
        return "/candidate/overview";
      case "interviewer":
        return "/interviewer/overview";
      case "coordinator":
        return "/coordinator/overview";
    }
  };

  const login = async (
    email: string,
    _password?: string,
    forcedRole?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check against predefined demo accounts
    let matchedUser: UserAccount | null = null;
    if (forcedRole && DEMO_USERS[forcedRole]) {
      matchedUser = { ...DEMO_USERS[forcedRole], email: trimmedEmail || DEMO_USERS[forcedRole].email };
    } else if (trimmedEmail.includes("candidate") || trimmedEmail.includes("patel") || trimmedEmail.includes("student")) {
      matchedUser = { ...DEMO_USERS.candidate, email: trimmedEmail };
    } else if (trimmedEmail.includes("interviewer") || trimmedEmail.includes("faculty") || trimmedEmail.includes("sethi")) {
      matchedUser = { ...DEMO_USERS.interviewer, email: trimmedEmail };
    } else if (trimmedEmail.includes("coord") || trimmedEmail.includes("admin") || trimmedEmail.includes("placement")) {
      matchedUser = { ...DEMO_USERS.coordinator, email: trimmedEmail };
    } else {
      // Default to candidate if role not deduced
      matchedUser = {
        id: `user-${Date.now()}`,
        name: trimmedEmail.split("@")[0] || "User",
        email: trimmedEmail,
        role: "candidate",
        avatarLetter: (trimmedEmail[0] || "U").toUpperCase(),
      };
    }

    setUser(matchedUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedUser));
    } catch {
      // ignore
    }
    return { success: true };
  };

  const signUp = async (
    name: string,
    email: string,
    _password?: string,
    role: UserRole = "candidate"
  ): Promise<{ success: boolean; error?: string }> => {
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      avatarLetter: name.trim().charAt(0).toUpperCase() || "U",
    };

    setUser(newUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // ignore
    }
    return { success: true };
  };

  const loginAsDemo = (role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    setUser(demoUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signUp,
        loginAsDemo,
        logout,
        getDefaultDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
