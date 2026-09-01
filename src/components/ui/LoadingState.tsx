type LoadingStateProps = {
  label?: string;
  count?: number;
  variant?: 'grid' | 'detail';
};

export function LoadingState({
  label = 'Loading',
  count = 6,
  variant = 'grid',
}: LoadingStateProps) {
  if (variant === 'detail') {
    return (
      <div aria-busy="true" aria-label={label}>
        <div className="skeleton hero" />
        <div className="skeleton block" />
        <div className="skeleton block" />
      </div>
    );
  }

  return (
    <div className="skeleton-grid" aria-busy="true" aria-label={label}>
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton" key={index} />
      ))}
    </div>
  );
}
