import { Linkedin, Facebook, Instagram, ArrowRight } from 'lucide-react';
import { Logo } from '../../components/Logo';
import './LandingFooter.css';

const SOCIAL = [
  { id: 'x', label: 'X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
] as const;

function SocialIcon({ id }: { id: (typeof SOCIAL)[number]['id'] }) {
  if (id === 'x') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (id === 'linkedin') return <Linkedin size={15} strokeWidth={2} />;
  if (id === 'facebook') return <Facebook size={15} strokeWidth={2} />;
  return <Instagram size={15} strokeWidth={2} />;
}

export function LandingFooter() {
  return (
    <footer className="pp-foot">
      <div className="pp-foot__inner">
        <div className="pp-foot__brand">
          <Logo size={28} className="pp-foot__logo" />
          <div className="pp-foot__social" aria-hidden="true">
            {SOCIAL.map((item) => (
              <button key={item.id} type="button" className="pp-foot__social-btn" tabIndex={-1}>
                <SocialIcon id={item.id} />
              </button>
            ))}
          </div>
        </div>

        <p className="pp-foot__pitch">
          Get the latest insights on today&apos;s world of work delivered straight to your inbox.
        </p>

        <div className="pp-foot__subscribe">
          <form
            className="pp-foot__form"
            onSubmit={(event) => event.preventDefault()}
            noValidate
          >
            <input
              className="pp-foot__email"
              type="email"
              placeholder="What's your e-mail?"
              autoComplete="off"
              readOnly
              tabIndex={-1}
              aria-hidden="true"
            />
            <button type="button" className="pp-foot__send" tabIndex={-1} aria-hidden="true">
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="pp-foot__legal">
            I confirm that I have read <strong>peoplepay Privacy Policy</strong> and agree with it.
          </p>
        </div>
      </div>
    </footer>
  );
}
