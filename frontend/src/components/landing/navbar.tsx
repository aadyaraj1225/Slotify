import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const isLandingPage = location.pathname === "/";

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isLandingPage && href.startsWith("#")) {
      e.preventDefault();
      const targetElement = document.querySelector(href);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        setMobileMenuOpen(false);
      }
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#252525] bg-deep-black/95 backdrop-blur-md text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Left: Slotify Brand Mark */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-lime rounded-md"
            aria-label="Slotify Home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-electric-lime text-deep-black font-mono font-black text-sm border border-deep-black shadow-[2px_2px_0px_#F542A6]">
              S
            </div>
            <span className="font-heading text-xl font-black tracking-tight text-white">
              Slotify
            </span>
          </Link>

          {/* Center-Left: Main Navigation Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, "#how-it-works")}
              className="text-xs font-mono uppercase tracking-wider text-muted-gray hover:text-white transition-colors"
            >
              How it Works
            </a>
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, "#features")}
              className="text-xs font-mono uppercase tracking-wider text-muted-gray hover:text-white transition-colors"
            >
              Features
            </a>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-5">
          <Link
            to="/login"
            className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-gray hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center text-xs font-mono font-bold uppercase tracking-wider bg-electric-lime text-deep-black border-2 border-deep-black hover:bg-[#c9f228] px-4 py-2 rounded shadow-[2px_2px_0px_#101010] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded p-2 text-muted-gray hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-lime"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#252525] bg-near-black px-6 py-6 text-left space-y-4">
          <nav className="flex flex-col space-y-3">
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, "#how-it-works")}
              className="text-sm font-mono uppercase tracking-wider text-muted-gray hover:text-white py-1"
            >
              How it Works
            </a>
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, "#features")}
              className="text-sm font-mono uppercase tracking-wider text-muted-gray hover:text-white py-1"
            >
              Features
            </a>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-mono uppercase tracking-wider text-muted-gray hover:text-white py-1"
            >
              Sign In
            </Link>
          </nav>
          <div className="pt-3 border-t border-[#252525]">
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center text-xs font-mono font-bold uppercase tracking-wider bg-electric-lime text-deep-black border-2 border-deep-black px-4 py-2.5 rounded shadow-[2px_2px_0px_#101010]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
