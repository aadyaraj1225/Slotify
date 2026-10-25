import * as React from "react";
import type { UserAccount, UserRole } from "@/types/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: UserRole) => void;
  logout: () => Promise<void>;
  getDefaultDashboardRoute: (role: UserRole) => string;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<UserAccount | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

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

  // Fetch verified profile and role from the FastAPI backend using JWT token
  const fetchBackendProfile = async (accessToken: string): Promise<UserAccount | null> => {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (resp.ok) {
        const data = await resp.json();
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          avatarLetter: (data.name?.[0] || data.email?.[0] || "U").toUpperCase(),
        };
      }
    } catch {
      // Backend not running or unreachable
    }
    return null;
  };

  // Sync profile to database on signup
  const syncBackendProfile = async (
    userId: string,
    name: string,
    email: string,
    requestedRole: UserRole
  ): Promise<UserAccount | null> => {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/sync-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          name,
          email,
          requested_role: requestedRole,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          avatarLetter: (data.name?.[0] || "U").toUpperCase(),
        };
      }
    } catch {
      // Fallback
    }
    return null;
  };

  // Restore session on mount
  React.useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      setIsLoading(true);

      // 1. If Supabase is configured, restore via Supabase Auth
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (!error && data.session) {
            const accessToken = data.session.access_token;
            setToken(accessToken);

            // Fetch verified backend role
            const profile = await fetchBackendProfile(accessToken);
            if (profile && mounted) {
              setUser(profile);
              setIsLoading(false);
              return;
            } else if (mounted) {
              // Construct user from Supabase metadata if backend endpoint is unavailable
              const meta = data.session.user.user_metadata || {};
              const restoredUser: UserAccount = {
                id: data.session.user.id,
                name: meta.name || data.session.user.email?.split("@")[0] || "User",
                email: data.session.user.email || "",
                role: (meta.role as UserRole) || "candidate",
                avatarLetter: ((meta.name || data.session.user.email)?.[0] || "U").toUpperCase(),
              };
              setUser(restoredUser);
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // Continue to fallback
        }
      }

      // 2. Restore cached local session if exists
      try {
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved && mounted) {
          const parsed = JSON.parse(saved);
          setUser(parsed);
        }
      } catch {
        // ignore
      }

      if (mounted) {
        setIsLoading(false);
      }
    };

    restoreSession();

    // Listen to Supabase auth state changes if enabled
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          if (mounted) {
            setUser(null);
            setToken(null);
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (mounted && session) {
            setToken(session.access_token);
            const prof = await fetchBackendProfile(session.access_token);
            if (prof && mounted) {
              setUser(prof);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(prof));
            }
          }
        }
      });
      authListener = data;
    }

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password?: string,
    forcedRole?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. If Supabase is configured and password is provided, perform live Supabase Auth login
    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.session) {
          setToken(data.session.access_token);

          // Verify role from backend database
          const backendProfile = await fetchBackendProfile(data.session.access_token);
          if (backendProfile) {
            setUser(backendProfile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(backendProfile));
            return { success: true };
          }

          // Fallback to metadata
          const metaRole = (data.user.user_metadata?.role as UserRole) || "candidate";
          const loggedInUser: UserAccount = {
            id: data.user.id,
            name: data.user.user_metadata?.name || trimmedEmail.split("@")[0],
            email: trimmedEmail,
            role: metaRole,
            avatarLetter: (trimmedEmail[0] || "U").toUpperCase(),
          };
          setUser(loggedInUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || "Failed to authenticate with Supabase" };
      }
    }

    // 2. Demo and local development fallback
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
    password?: string,
    role: UserRole = "candidate"
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Security check: Public registration cannot self-assign coordinator
    const assignedRole = role === "coordinator" ? "candidate" : role;

    // 1. If Supabase is configured, perform real registration
    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              name: cleanName,
              role: assignedRole,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Sync profile to backend database
          const backendProfile = await syncBackendProfile(data.user.id, cleanName, trimmedEmail, assignedRole);
          const newUser: UserAccount = backendProfile || {
            id: data.user.id,
            name: cleanName,
            email: trimmedEmail,
            role: assignedRole,
            avatarLetter: cleanName.charAt(0).toUpperCase() || "U",
          };

          setUser(newUser);
          if (data.session) {
            setToken(data.session.access_token);
          }
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || "Registration failed" };
      }
    }

    // 2. Demo mode registration
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: trimmedEmail,
      role: assignedRole,
      avatarLetter: cleanName.charAt(0).toUpperCase() || "U",
    };

    setUser(newUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // ignore
    }
    return { success: true };
  };

  const loginAsDemo = (demoRole: UserRole) => {
    const demoUser = DEMO_USERS[demoRole];
    setUser(demoUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
    } catch {
      // ignore
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setUser(null);
    setToken(null);
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
        isLoading,
        token,
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
