import * as React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
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
  const [demoRole, setDemoRole] = React.useState<UserRole>("candidate");

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
      if (!res.success) {
        setError(res.error || "Authentication failed.");
      }
    } catch {
      setError("An unexpected error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExploreDemo = () => {
    loginAsDemo(demoRole);
    const target = getDefaultDashboardRoute(demoRole);
    navigate(target, { replace: true });
  };

  return (
    <div className="min-h-screen bg-near-black flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 font-body text-white">
      {/* Top Header Strip */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between pb-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-electric-lime text-deep-black font-mono font-black text-lg border-2 border-deep-black shadow-[2px_2px_0px_#F542A6] group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="font-heading text-2xl font-black tracking-tight text-white">
            Slotify
          </span>
        </Link>
        <Link
          to="/"
          className="text-xs font-mono font-bold uppercase tracking-wider text-muted-gray hover:text-electric-lime transition-colors"
        >
          &larr; Public Site
        </Link>
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-md mx-auto my-auto">
        <div className="rounded-2xl border-2 border-deep-black bg-white p-6 sm:p-8 md:p-10 text-deep-black shadow-[6px_6px_0px_#D7FF35]">
          <div className="space-y-1.5 mb-6 text-left">
            <h1 className="font-heading text-3xl font-black tracking-tight text-deep-black">
              Sign In
            </h1>
            <p className="font-body text-xs text-slate-gray">
              Enter your credentials to access your recruitment portal.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-[#FF6262]/10 border-2 border-error-red p-3 mb-5 text-xs text-error-red font-medium text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-deep-black mb-1.5">
                Password
              </label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-gray hover:text-deep-black p-1"
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
              className="w-full justify-center text-xs font-bold gap-2 mt-2 bg-electric-lime text-deep-black border-2 border-deep-black shadow-[3px_3px_0px_#101010] hover:bg-[#c9f228]"
            >
              <span>{isLoading ? "Signing In..." : "Sign In"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Simple Link to Sign Up */}
          <div className="mt-5 text-center text-xs text-slate-gray">
            New to Slotify?{" "}
            <Link to="/signup" className="font-bold text-deep-black hover:text-hot-pink underline">
              Create an account
            </Link>
          </div>

          {/* Integrated Explore Demo Access */}
          <div className="mt-6 pt-5 border-t-2 border-deep-black/10 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-deep-black">
                Explore Demo
              </span>
              <span className="font-mono text-[10px] text-slate-gray">
                No credentials needed
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoRole("candidate")}
                className={`rounded-lg border-2 border-deep-black p-2 text-center text-xs font-mono font-bold transition-all ${
                  demoRole === "candidate"
                    ? "bg-electric-lime text-deep-black shadow-[2px_2px_0px_#101010]"
                    : "bg-warm-offwhite text-slate-gray hover:text-deep-black"
                }`}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setDemoRole("interviewer")}
                className={`rounded-lg border-2 border-deep-black p-2 text-center text-xs font-mono font-bold transition-all ${
                  demoRole === "interviewer"
                    ? "bg-sky-blue text-deep-black shadow-[2px_2px_0px_#101010]"
                    : "bg-warm-offwhite text-slate-gray hover:text-deep-black"
                }`}
              >
                Interviewer
              </button>
              <button
                type="button"
                onClick={() => setDemoRole("coordinator")}
                className={`rounded-lg border-2 border-deep-black p-2 text-center text-xs font-mono font-bold transition-all ${
                  demoRole === "coordinator"
                    ? "bg-hot-pink text-white shadow-[2px_2px_0px_#101010]"
                    : "bg-warm-offwhite text-slate-gray hover:text-deep-black"
                }`}
              >
                Coordinator
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleExploreDemo}
              className="w-full justify-center text-xs font-bold border-2 border-deep-black bg-white hover:bg-warm-offwhite"
            >
              <span>Launch Demo Dashboard as {DEMO_USERS[demoRole].name.split(" ")[0]}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>

            <p className="text-[10px] font-mono text-slate-gray text-center pt-1">
              Demo mode stores session data in local browser storage.
            </p>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="w-full max-w-md mx-auto text-center pt-6 text-[11px] font-mono text-muted-gray">
        &copy; 2026 Slotify: The Ancient One's Trials
      </footer>
    </div>
  );
};
