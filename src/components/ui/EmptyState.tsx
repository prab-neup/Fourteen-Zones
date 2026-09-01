import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="state-panel" role="status">
      <p className="eyebrow">Nothing here</p>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      {action ? <div style={{ marginTop: 18 }}>{action}</div> : null}
    </section>
  );
}
