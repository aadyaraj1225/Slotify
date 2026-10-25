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
        <Link to="/login" className="text-xs font-mono font-bold text-slate-gray hover:text-deep-black uppercase">
          Already registered &rarr;
        </Link>
      </div>

      {/* Main SignUp Card */}
      <div className="max-w-md w-full mx-auto rounded-2xl border-2 border-deep-black bg-white p-8 sm:p-10 shadow-[6px_6px_0px_#101010]">
        <div className="space-y-2 mb-8">
          <h1 className="font-heading text-3xl font-black text-deep-black tracking-tight">
            Create Account
          </h1>
          <p className="font-body text-xs text-slate-gray">
            Join the recruitment network to schedule campus interviews or evaluate candidate panels.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-error-red/10 border-2 border-error-red p-3 mb-6 text-xs text-error-red font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-deep-black mb-1.5">
              Full Legal Name
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
              Primary Role in Recruitment
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`rounded-lg border-2 border-deep-black p-2.5 text-center text-xs font-mono font-bold transition-all ${
                  role === "candidate"
                    ? "bg-electric-lime text-deep-black shadow-[2px_2px_0px_#101010]"
                    : "bg-white text-slate-gray hover:bg-warm-offwhite"
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
                    : "bg-white text-slate-gray hover:bg-warm-offwhite"
                }`}
              >
                Interviewer
              </button>
              <button
                type="button"
                onClick={() => setRole("coordinator")}
                className={`rounded-lg border-2 border-deep-black p-2.5 text-center text-xs font-mono font-bold transition-all ${
                  role === "coordinator"
                    ? "bg-hot-pink text-white shadow-[2px_2px_0px_#101010]"
                    : "bg-white text-slate-gray hover:bg-warm-offwhite"
                }`}
              >
                Coordinator
              </button>
            </div>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-gray hover:text-deep-black"
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
            className="w-full justify-center text-xs font-bold gap-2 mt-3"
          >
            <span>{isLoading ? "Creating Account..." : "Complete Registration"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-deep-black/10 text-center text-xs text-slate-gray">
          Already registered?{" "}
          <Link to="/login" className="font-bold text-deep-black hover:text-hot-pink underline">
            Sign In instead
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center pt-8 text-[11px] font-mono text-slate-gray">
        &copy; 2026 Slotify: The Ancient One's Trials
      </div>
    </div>
  );
};
