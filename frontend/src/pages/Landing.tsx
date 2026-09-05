import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../auth/AuthContext';
import { Logo } from '../components/Logo';
import { WhySection } from './landing/WhySection';
import { ModulesSection } from './landing/ModulesSection';
import { HoodSection } from './landing/HoodSection';
import './Landing.css';

const NAV = [
  { id: 'why', label: 'why peoplepay' },
  { id: 'modules', label: 'our modules' },
  { id: 'hood', label: 'under the hood' },
] as const;

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const [onHero, setOnHero] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('pp-landing-scroll');
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);

    const io = new IntersectionObserver(
      ([entry]) => setOnHero(entry.isIntersecting),
      { threshold: 0.4 },
    );
    if (heroRef.current) io.observe(heroRef.current);
    return () => {
      io.disconnect();
      document.documentElement.classList.remove('pp-landing-scroll');
    };
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const onLogin = () => {
    navigate(user ? '/dashboard' : '/login');
  };

  return (
    <div className="pp-landing">
      <header className={clsx('pp-landing__nav', !onHero && 'pp-landing__nav--light')}>
        <nav className="pp-landing__links" aria-label="Page">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(item.id);
              }}
            >
              {item.label}
            </a>
          ))}
          <span className="pp-landing__pricing">pricing</span>
        </nav>
        <div className="pp-landing__nav-cta">
          <button type="button" className="pp-landing__login" onClick={onLogin}>
            {user ? 'Enter' : 'Login'}
          </button>
          <button type="button" className="pp-landing__demo">
            Book a demo
          </button>
        </div>
      </header>

      <section ref={heroRef} className="pp-landing__hero" aria-label="peoplepay">
        <Logo as="h1" className="pp-landing__mark" />
      </section>

      <WhySection />
      <ModulesSection />
      <HoodSection />
    </div>
  );
}
