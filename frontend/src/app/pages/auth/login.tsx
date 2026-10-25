import * as React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, UserCheck } from "lucide-react";
import { useAuth, DEMO_USERS } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/auth";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo, getDefaultDashboardRoute, isAuthenticated, user } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // If already authenticated, redirect to user's dashboard
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const target = (location.state as { from?: { pathname: string } })?.from?.pathname || getDefaultDashboardRoute(user.role);
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state, getDefaultDashboardRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please provide your email address.");
      return;
    }
    if (!password) {
      setError("Please provide your password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        // Will be redirected by useEffect
      } else {
        setError(res.error || "Authentication failed.");
      }
    } catch {
      setError("An unexpected error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    loginAsDemo(role);
    const target = getDefaultDashboardRoute(role);
    navigate(target, { replace: true });
  };

  return (
    <div className="min-h-screen bg-warm-offwhite flex flex-col justify-between py-12 px-6 sm:px-10 font-body text-deep-black text-left">
      {/* Top Bar with Brand Link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pb-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-electric-lime text-deep-black font-mono font-black text-base shadow-[2px_2px_0px_#101010] border-2 border-deep-black">
            S
          </div>
          <span className="font-heading text-2xl font-black tracking-tight text-deep-black">
            Slotify
          </span>
        </Link>
        <Link to="/" className="text-xs font-mono font-bold text-slate-gray hover:text-deep-black uppercase">
          Back to site &rarr;
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto rounded-2xl border-2 border-deep-black bg-white p-8 sm:p-10 shadow-[6px_6px_0px_#101010]">
        <div className="space-y-2 mb-8">
          <h1 className="font-heading text-3xl font-black text-deep-black tracking-tight">
            Sign In
          </h1>
          <p className="font-body text-xs text-slate-gray">
            Enter your credentials to enter your role-specific recruitment portal.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-error-red/10 border-2 border-error-red p-3 mb-6 text-xs text-error-red font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-deep-black mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@campus.edu"
              className="w-full h-11 rounded-lg border-2 border-deep-black bg-warm-offwhite px-3.5 text-xs text-deep-black font-mono focus:outline-none focus:ring-2 focus:ring-electric-lime"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-deep-black">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-11 rounded-lg border-2 border-deep-black bg-warm-offwhite px-3.5 pr-10 text-xs text-deep-black font-mono focus:outline-none focus:ring-2 focus:ring-electric-lime"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-gray hover:text-deep-black"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="w-full justify-center text-xs font-bold gap-2 mt-2"
          >
            <span>{isLoading ? "Authenticating..." : "Sign In to Portal"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-deep-black/10 text-center text-xs text-slate-gray">
          Don't have an account yet?{" "}
          <Link to="/signup" className="font-bold text-deep-black hover:text-hot-pink underline">
            Register here
          </Link>
        </div>

        {/* Explicitly Labeled Demo Access Strip */}
        <div className="mt-8 pt-6 border-t-2 border-deep-black">
          <div className="flex items-center gap-1.5 mb-2">
            <UserCheck className="h-4 w-4 text-hot-pink" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-deep-black">
              Evaluator Demo Access
            </span>
          </div>
          <p className="font-body text-[11px] text-slate-gray mb-3 leading-relaxed">
            Fast-track preview to evaluate each isolated role dashboard:
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("candidate")}
              className="rounded-lg border-2 border-deep-black bg-white p-2 text-center hover:bg-electric-lime transition-colors shadow-[2px_2px_0px_#101010]"
            >
              <span className="font-mono text-[10px] uppercase font-bold text-deep-black block">Candidate</span>
              <span className="text-[9px] text-slate-gray block truncate">{DEMO_USERS.candidate.name.split(" ")[0]}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("interviewer")}
              className="rounded-lg border-2 border-deep-black bg-white p-2 text-center hover:bg-sky-blue transition-colors shadow-[2px_2px_0px_#101010]"
            >
              <span className="font-mono text-[10px] uppercase font-bold text-deep-black block">Interviewer</span>
              <span className="text-[9px] text-slate-gray block truncate">Dr. Sethi</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("coordinator")}
              className="rounded-lg border-2 border-deep-black bg-white p-2 text-center hover:bg-hot-pink hover:text-white transition-colors shadow-[2px_2px_0px_#101010]"
            >
              <span className="font-mono text-[10px] uppercase font-bold block">Coordinator</span>
              <span className="text-[9px] text-slate-gray block truncate">Admin Lead</span>
            </button>
          </div>

          <span className="block text-[10px] font-mono text-slate-gray/70 mt-3 text-center">
            Notice: Demo access simulates authentication in client storage. Production requires OAuth/JWT backend integration.
          </span>
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-md w-full mx-auto text-center pt-8 text-[11px] font-mono text-slate-gray">
        &copy; 2026 Slotify: The Ancient One's Trials
      </div>
    </div>
  );
};
