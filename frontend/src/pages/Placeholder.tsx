import { ReactNode } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardBody } from '../components/Card';
import { Sparkles } from 'lucide-react';

export function PlaceholderPage({ title, subtitle, module, icon }: { title: string; subtitle?: string; module: string; icon?: ReactNode }) {
  return (
    <div className="pp-stack">
      <PageHeader title={title} subtitle={subtitle} />
      <Card>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '56px 16px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, var(--pp-primary-500), var(--pp-primary-700))', color: 'var(--pp-white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 28px rgba(91, 71, 255, 0.28)' }}>
              {icon || <Sparkles size={26} />}
            </div>
            <h2 style={{ letterSpacing: '-0.02em' }}>{module} module is on the way</h2>
            <p className="pp-muted" style={{ maxWidth: 520 }}>
              Full UI for this module ships in the next frontend push. The backend API for it is already live at <span className="pp-mono">/api/v1</span>.
              You can browse it from the Swagger UI while the interface is being built.
            </p>
            <a href="/api/docs" target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: 'var(--pp-primary-600)' }}>
              Open API docs
            </a>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
