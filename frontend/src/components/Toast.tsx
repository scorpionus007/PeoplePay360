import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import clsx from 'clsx';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import './Toast.css';

type ToastKind = 'success' | 'error' | 'warning' | 'info';
type Toast = { id: string; kind: ToastKind; title: string; description?: string };

type ToastContextValue = {
  push: (t: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = `tst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, ...t }]);
      const timer = window.setTimeout(() => remove(id), 4500);
      timers.current.set(id, timer);
    },
    [remove]
  );

  const success = useCallback((title: string, description?: string) => push({ kind: 'success', title, description }), [push]);
  const error = useCallback((title: string, description?: string) => push({ kind: 'error', title, description }), [push]);
  const warning = useCallback((title: string, description?: string) => push({ kind: 'warning', title, description }), [push]);
  const info = useCallback((title: string, description?: string) => push({ kind: 'info', title, description }), [push]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  return (
    <ToastContext.Provider value={{ push, success, error, warning, info }}>
      {children}
      <div className="pp-toaster">
        {toasts.map((t) => {
          const Icon = t.kind === 'success' ? CheckCircle2 : t.kind === 'error' ? XCircle : t.kind === 'warning' ? AlertTriangle : Info;
          return (
            <div key={t.id} className={clsx('pp-toast', `pp-toast--${t.kind}`)}>
              <div className="pp-toast__icon"><Icon size={18} /></div>
              <div className="pp-toast__body">
                <div className="pp-toast__title">{t.title}</div>
                {t.description && <div className="pp-toast__desc">{t.description}</div>}
              </div>
              <button className="pp-toast__close" onClick={() => remove(t.id)} aria-label="Dismiss"><X size={14} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
