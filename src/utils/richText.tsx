import React from 'react';

const ALLOWED_HL_CLASSES = new Set([
  'hl-def',
  'hl-func',
  'hl-cause',
  'hl-warn',
  'hl-class',
  'hl-diff',
  'hl-num',
  'hl-exam',
]);

export interface PairHighlightSync {
  activePair: string | null;
  onEnterPair: (pairId: string) => void;
  onLeavePair: (pairId: string) => void;
  onTogglePair: (pairId: string) => void;
}

/**
 * Strips HTML tags into plain text for fast client-side search indexing.
 */
export function stripHtmlToText(html: string): string {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function renderDomNode(
  node: ChildNode,
  key: string,
  pairSync?: PairHighlightSync,
): React.ReactNode {
  if (node.nodeType === 3) {
    return node.textContent;
  }
  if (node.nodeType !== 1) {
    return null;
  }

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const children = Array.from(el.childNodes).map((child, idx) =>
    renderDomNode(child, `${key}-${idx}`, pairSync),
  );

  if (tag === 'mark') {
    const rawCls = el.getAttribute('class') || '';
    const validCls = rawCls
      .split(/\s+/)
      .filter((c) => ALLOWED_HL_CLASSES.has(c))
      .join(' ');
    const pairId = el.getAttribute('data-pair') || undefined;
    const isActive = Boolean(pairId && pairSync && pairSync.activePair === pairId);
    const fullCls = [validCls, isActive ? 'hl-pair-active' : ''].filter(Boolean).join(' ');

    return (
      <mark
        key={key}
        className={fullCls || undefined}
        data-pair={pairId}
        onMouseEnter={pairId && pairSync ? () => pairSync.onEnterPair(pairId) : undefined}
        onMouseLeave={pairId && pairSync ? () => pairSync.onLeavePair(pairId) : undefined}
        onClick={pairId && pairSync ? () => pairSync.onTogglePair(pairId) : undefined}
      >
        {children}
      </mark>
    );
  }

  if (tag === 'span') {
    const cls = el.getAttribute('class') === 'iq-speaker-label' ? 'iq-speaker-label' : undefined;
    return (
      <span key={key} className={cls}>
        {children}
      </span>
    );
  }

  if (tag === 'h4') return <h4 key={key}>{children}</h4>;
  if (tag === 'p') return <p key={key}>{children}</p>;
  if (tag === 'ul') return <ul key={key}>{children}</ul>;
  if (tag === 'ol') return <ol key={key}>{children}</ol>;
  if (tag === 'li') return <li key={key}>{children}</li>;
  if (tag === 'strong') return <strong key={key}>{children}</strong>;
  if (tag === 'em') return <em key={key}>{children}</em>;
  if (tag === 'br') return <br key={key} />;
  if (tag === 'table') return <table key={key} className="rad-table">{children}</table>;
  if (tag === 'thead') return <thead key={key}>{children}</thead>;
  if (tag === 'tbody') return <tbody key={key}>{children}</tbody>;
  if (tag === 'tr') return <tr key={key}>{children}</tr>;
  if (tag === 'th') return <th key={key}>{children}</th>;
  if (tag === 'td') return <td key={key}>{children}</td>;

  return <React.Fragment key={key}>{children}</React.Fragment>;
}

/**
 * Safely parses trusted lecture HTML snippets into pure React elements
 * without raw HTML string injection, supporting synchronized <mark data-pair>.
 */
export function RichLectureContent({
  html,
  pairSync,
}: {
  html: string;
  pairSync?: PairHighlightSync;
}) {
  if (!html) return null;
  if (typeof DOMParser === 'undefined') {
    return <>{stripHtmlToText(html)}</>;
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (
    <>
      {Array.from(doc.body.childNodes).map((node, idx) =>
        renderDomNode(node, `n-${idx}`, pairSync),
      )}
    </>
  );
}

/**
 * Renders text strings containing <mark class="hl-..."> markup (e.g. helperNote, review points)
 * strictly as React nodes.
 */
export function MarkedText({text}: {text: string}) {
  if (!text) return null;
  if (typeof DOMParser === 'undefined') {
    return <>{stripHtmlToText(text)}</>;
  }
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return (
    <>
      {Array.from(doc.body.childNodes).map((node, idx) => renderDomNode(node, `m-${idx}`))}
    </>
  );
}
