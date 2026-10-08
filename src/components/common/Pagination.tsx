interface Props {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}

export default function Pagination({ page, pages, onChange }: Props) {
  if (pages <= 1) return null;
  // Show first, last and a window around the current page.
  const nums = [...new Set([1, pages, page - 1, page, page + 1])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  return (
    <nav className="pagination" aria-label="Pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {nums.map((n, i) => (
        <span key={n} style={{ display: 'contents' }}>
          {i > 0 && n - nums[i - 1] > 1 && <button disabled>…</button>}
          <button aria-current={n === page ? 'page' : undefined} onClick={() => onChange(n)}>{n}</button>
        </span>
      ))}
      <button disabled={page === pages} onClick={() => onChange(page + 1)}>›</button>
    </nav>
  );
}
