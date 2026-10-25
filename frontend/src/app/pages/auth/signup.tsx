import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/auth";

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, getDefaultDashboardRoute } = useAuth();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("candidate");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please provide your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please provide an institutional email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await signUp(name, email, password, role);
      if (res.success) {
        const target = getDefaultDashboardRoute(role);
        navigate(target, { replace: true });
      } else {
        setError(res.error || "Registration could not be completed.");
      }
    } catch {
      setError("An unexpected error occurred during account registration.");
    } finally {
      setIsLoading(false);
    }
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

      {/* Main SignUp Card */}
      <main className="w-full max-w-md mx-auto my-auto">
        <div className="rounded-2xl border-2 border-deep-black bg-white p-6 sm:p-8 md:p-10 text-deep-black shadow-[6px_6px_0px_#D7FF35]">
          <div className="space-y-1.5 mb-6 text-left">
            <h1 className="font-heading text-3xl font-black tracking-tight text-deep-black">
              Create Account
            </h1>
            <p className="font-body text-xs text-slate-gray">
              Register to access your recruitment interview portal.
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Nair"
                className="w-full h-11 rounded-lg border-2 border-deep-black bg-warm-offwhite px-3.5 text-xs text-deep-black font-mono focus:outline-none focus:ring-2 focus:ring-electric-lime"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-deep-black mb-1.5">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya.nair@campus.edu"
                className="w-full h-11 rounded-lg border-2 border-deep-black bg-warm-offwhite px-3.5 text-xs text-deep-black font-mono focus:outline-none focus:ring-2 focus:ring-electric-lime"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-deep-black mb-1.5">
                Primary Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("candidate")}
                  className={`rounded-lg border-2 border-deep-black p-2.5 text-center text-xs font-mono font-bold transition-all ${
                    role === "candidate"
                      ? "bg-electric-lime text-deep-black shadow-[2px_2px_0px_#101010]"
                      : "bg-warm-offwhite text-slate-gray hover:text-deep-black"
                  }`}
                >
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setRole("interviewer")}
                  className={`rounded-lg border-2 border-deep-black p-2.5 text-center text-xs font-mono font-bold transition-all ${
                    role === "interviewer"
                      ? "bg-sky-blue text-deep-black shadow-[2px_2px_0px_#101010]"
                      : "bg-warm-offwhite text-slate-gray hover:text-deep-black"
                  }`}
                >
                  Interviewer
                </button>
              </div>
              <p className="mt-1 text-[10px] font-mono text-slate-gray">
                Coordinator access requires institutional administrator provisioning.
              </p>
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
                  placeholder="At least 6 characters"
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

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-deep-black mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-11 rounded-lg border-2 border-deep-black bg-warm-offwhite px-3.5 text-xs text-deep-black font-mono focus:outline-none focus:ring-2 focus:ring-electric-lime"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full justify-center text-xs font-bold gap-2 mt-2 bg-electric-lime text-deep-black border-2 border-deep-black shadow-[3px_3px_0px_#101010] hover:bg-[#c9f228]"
            >
              <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Simple Link to Sign In */}
          <div className="mt-5 text-center text-xs text-slate-gray">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-deep-black hover:text-hot-pink underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center pt-6 text-[11px] font-mono text-muted-gray">
        &copy; 2026 Slotify: The Ancient One's Trials
      </footer>
    </div>
  );
};
