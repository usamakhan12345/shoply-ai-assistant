export function Spinner({ small }: { small?: boolean }) {
  return <div className={`spinner${small ? ' spinner--sm' : ''}`} role="status" aria-label="Loading" />;
}

export function PageLoader({ text = 'Loading…' }: { text?: string }) {
  return (
    <div className="center-box">
      <Spinner />
      <span className="muted">{text}</span>
    </div>
  );
}
