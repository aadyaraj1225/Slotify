import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const isLandingPage = location.pathname === "/";

  const navLinks = [
    { label: "How it Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
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
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Slotify Logo & Name */}
        <Link
          to="/"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-lime rounded-md"
          aria-label="Slotify Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded bg-electric-lime text-deep-black font-mono font-black text-base shadow-[2px_2px_0px_#F542A6]">
            S
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-white">
            Slotify
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const destination = isLandingPage ? link.href : `/${link.href}`;
            return (
              <a
                key={link.label}
                href={destination}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-xs uppercase tracking-wider font-mono text-muted-gray hover:text-white transition-colors"
              >
                {link.label}
              </a>
            );
          })}
          <Link
            to="/coordinator/overview"
            className="text-xs uppercase tracking-wider font-mono text-muted-gray hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </nav>

        {/* Desktop Primary Action */}
        <div className="hidden sm:flex items-center gap-4">
          <Link to="/coordinator/overview">
            <Button variant="primary" size="sm" className="px-5 py-2 text-xs">
              Get Started
            </Button>
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
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#252525] bg-near-black px-6 py-6 text-left space-y-4">
          <nav className="flex flex-col space-y-3" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const destination = isLandingPage ? link.href : `/${link.href}`;
              return (
                <a
                  key={link.label}
                  href={destination}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-mono uppercase tracking-wider text-muted-gray hover:text-white py-2"
                >
                  {link.label}
                </a>
              );
            })}
            <Link
              to="/coordinator/overview"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-mono uppercase tracking-wider text-muted-gray hover:text-white py-2"
            >
              Dashboard
            </Link>
          </nav>
          <div className="pt-4 border-t border-[#252525]">
            <Link to="/coordinator/overview" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full justify-center">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
