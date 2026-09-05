import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useAuth } from '../auth/AuthContext';
import { Logo } from '../components/Logo';
import { WhySection } from './landing/WhySection';
import { ModulesSection } from './landing/ModulesSection';
import { HoodSection } from './landing/HoodSection';
import { CrowdCanvas } from '../components/v1/skiper39';
import { LandingFooter } from './landing/LandingFooter';
import './Landing.css';

const NAV = [
  { id: 'why', label: 'why peoplepay' },
  { id: 'modules', label: 'our modules' },
  { id: 'hood', label: 'under the hood' },
] as const;

const NAV_OFFSET = -96;

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [onHero, setOnHero] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('pp-landing-scroll');
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
      anchors: false,
    });
    lenisRef.current = lenis;
    lenis.scrollTo(0, { immediate: true });

    const io = new IntersectionObserver(
      ([entry]) => setOnHero(entry.isIntersecting),
      { threshold: 0.4 },
    );
    if (heroRef.current) io.observe(heroRef.current);
    return () => {
      io.disconnect();
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove('pp-landing-scroll');
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: NAV_OFFSET, lerp: 0.08 });
      return;
    }
    el.scrollIntoView({ behavior: 'smooth' });
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
        <div className="pp-landing__hero-crowd" aria-hidden="true">
          <CrowdCanvas src="/images/peeps/all-peeps.png" rows={15} cols={7} />
        </div>
      </section>

      <WhySection />
      <ModulesSection />
      <HoodSection />
      <LandingFooter />
    </div>
  );
}
