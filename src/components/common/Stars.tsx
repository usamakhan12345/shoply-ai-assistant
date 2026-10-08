interface Props {
  rating: number;
  count?: number;
}

export default function Stars({ rating, count }: Props) {
  if (!count) return <span className="stars muted">No ratings yet</span>;
  return (
    <span className="stars" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <span className="star" aria-hidden>★</span>
      {rating.toFixed(1)}
      <span className="count">({count})</span>
    </span>
  );
}
