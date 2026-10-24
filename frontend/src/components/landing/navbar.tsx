import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const isLandingPage = location.pathname === "/";

  const navLinks = [
    { label: "Overview", href: "#overview" },
    { label: "The Problem", href: "#problem" },
    { label: "Approach", href: "#approach" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Capabilities", href: "#capabilities" },
    { label: "Preview", href: "#preview" },
  ];

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

  // Close mobile menu on Escape key
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
    <header className="sticky top-0 z-50 w-full border-b border-soft-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted-cobalt rounded"
          aria-label="Slotify Home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted-cobalt text-white">
            <Calendar className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold tracking-tight text-charcoal leading-none">
              Slotify
            </span>
            <span className="font-body text-[10px] text-slate-gray leading-tight">
              The Ancient One's Trials
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-1 lg:gap-2"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const destination = isLandingPage ? link.href : `/${link.href}`;
            return (
              <a
                key={link.label}
                href={destination}
                onClick={(e) => handleNavClick(e, link.href)}
                className="rounded px-2.5 py-1.5 text-xs lg:text-sm font-medium font-body text-slate-gray hover:text-charcoal hover:bg-[#ECEAE4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted-cobalt"
              >
                {link.label}
              </a>
            );
          })}
          <Link
            to="/coordinator/overview"
            className="rounded px-2.5 py-1.5 text-xs lg:text-sm font-medium font-body text-slate-gray hover:text-charcoal hover:bg-[#ECEAE4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted-cobalt"
          >
            Dashboard
          </Link>
          <Link
            to="/showcase"
            className="rounded px-2.5 py-1.5 text-xs lg:text-sm font-medium font-body text-slate-gray hover:text-charcoal hover:bg-[#ECEAE4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted-cobalt"
          >
            Showcase
          </Link>
        </nav>

        {/* Desktop Action */}
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/get-started">
            <Button variant="primary" size="sm">
              Get started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <Link to="/get-started">
            <Button variant="primary" size="sm" className="h-8 px-2.5 text-xs">
              Get started
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded p-1.5 text-slate-gray hover:bg-[#ECEAE4] hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted-cobalt"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
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
        <div className="border-b border-soft-border bg-white px-4 pt-2 pb-6 sm:hidden animate-in fade-in-0 duration-150">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const destination = isLandingPage ? link.href : `/${link.href}`;
              return (
                <a
                  key={link.label}
                  href={destination}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="rounded px-3 py-2 text-sm font-medium font-body text-charcoal hover:bg-warm-ivory"
                >
                  {link.label}
                </a>
              );
            })}
            <Link
              to="/coordinator/overview"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded px-3 py-2 text-sm font-medium font-body text-charcoal hover:bg-warm-ivory"
            >
              Coordinator Dashboard
            </Link>
            <Link
              to="/showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded px-3 py-2 text-sm font-medium font-body text-charcoal hover:bg-warm-ivory"
            >
              Component Showcase
            </Link>
            <div className="pt-2 border-t border-soft-border">
              <Link
                to="/get-started"
                onClick={() => setMobileMenuOpen(false)}
                className="block"
              >
                <Button variant="primary" className="w-full justify-center">
                  Get started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
