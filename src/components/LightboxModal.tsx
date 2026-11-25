import React, {useEffect} from 'react';

interface LightboxModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  open,
  title,
  onClose,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div
      className={`lightbox-overlay ${open ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightboxTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="lightbox-dialog">
        <div className="lightbox-head">
          <div id="lightboxTitle" className="lightbox-title">
            {title}
          </div>
          <button
            type="button"
            className="lightbox-close"
            aria-label="إغلاق النافذة"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="lightbox-body">{open ? children : null}</div>
      </div>
    </div>
  );
};
