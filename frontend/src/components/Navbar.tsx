import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        scrolled ? 'backdrop-blur bg-white/80 dark:bg-[#0b1220]/80 shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl flex items-center space-x-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">SkillBridge</span>
          <span className="text-foreground/80">Pro</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/auth/register"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:scale-[1.02] transition-transform"
          >
            Register
          </Link>
          <Link
            to="/auth/login"
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border border-input/20 text-foreground/90 bg-white/20 backdrop-blur hover:bg-white/30 transition-colors"
          >
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}
