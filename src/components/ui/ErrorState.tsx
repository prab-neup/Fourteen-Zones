import { Button } from './Button';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <section className="state-panel" role="alert">
      <p className="eyebrow">Error</p>
      <h2>{title}</h2>
      <p className="muted">{message}</p>
      {onRetry ? (
        <div style={{ marginTop: 18 }}>
          <Button type="button" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </section>
  );
}
