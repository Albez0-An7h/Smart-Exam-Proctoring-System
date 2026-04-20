import { useEffect } from 'react';
import { RiAlertLine, RiCheckboxCircleLine, RiInformationLine, RiCloseLine } from 'react-icons/ri';

type ModalVariant = 'confirm' | 'alert' | 'danger';

interface ModalProps {
  open: boolean;
  title: string;
  message: string;
  variant?: ModalVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const icons: Record<ModalVariant, JSX.Element> = {
  confirm: <RiInformationLine size={22} style={{ color: 'var(--accent)' }} />,
  alert: <RiCheckboxCircleLine size={22} style={{ color: 'var(--success)' }} />,
  danger: <RiAlertLine size={22} style={{ color: 'var(--danger)' }} />,
};

export default function Modal({
  open,
  title,
  message,
  variant = 'confirm',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && onCancel) onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && onCancel) onCancel(); }}
    >
      <div
        style={{
          background: 'var(--surface, #1e1e2e)',
          border: '1px solid var(--border, rgba(255,255,255,0.1))',
          borderRadius: 16,
          padding: '1.75rem',
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 24px 56px rgba(0,0,0,0.5)',
          animation: 'modalSlideIn 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.9rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: variant === 'danger' ? 'rgba(220,38,38,0.12)'
              : variant === 'alert' ? 'rgba(34,197,94,0.12)'
              : 'rgba(99,102,241,0.12)',
          }}>
            {icons[variant]}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{title}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{message}</p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem', borderRadius: 6 }}
              aria-label="Close"
            >
              <RiCloseLine size={18} />
            </button>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          {onCancel && (
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.875rem' }}
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            style={{ fontSize: '0.875rem' }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
