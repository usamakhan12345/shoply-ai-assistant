import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { dismissToast, type Toast } from '@/store/uiSlice';

function Item({ t }: { t: Toast }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const id = setTimeout(() => dispatch(dismissToast(t.id)), 4000);
    return () => clearTimeout(id);
  }, [t.id, dispatch]);
  return (
    <div className={`toast toast--${t.kind}`} role="status">
      <span>{t.text}</span>
      <button aria-label="Dismiss" onClick={() => dispatch(dismissToast(t.id))}>×</button>
    </div>
  );
}

export default function Toasts() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  return <div className="toasts" aria-live="polite">{toasts.map((t) => <Item key={t.id} t={t} />)}</div>;
}
