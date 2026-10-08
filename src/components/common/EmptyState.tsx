import type { ReactNode } from 'react';

interface Props {
  emoji?: string;
  title: string;
  text?: string;
  action?: ReactNode;
}

export default function EmptyState({ emoji = '🗂️', title, text, action }: Props) {
  return (
    <div className="empty">
      <div className="emoji" aria-hidden>{emoji}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
