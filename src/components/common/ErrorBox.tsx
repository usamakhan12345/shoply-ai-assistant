interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBox({ message, onRetry }: Props) {
  return (
    <div className="alert alert--error" role="alert">
      {message}
      {onRetry && (
        <>
          {' '}
          <button className="btn btn--sm btn--outline" onClick={onRetry}>Retry</button>
        </>
      )}
    </div>
  );
}
