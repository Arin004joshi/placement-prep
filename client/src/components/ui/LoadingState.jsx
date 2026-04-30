const LoadingState = ({ label = "Loading" }) => (
  <div className="flex min-h-48 items-center justify-center rounded-md border border-line bg-white dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center gap-3 text-sm font-medium text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand" />
      {label}
    </div>
  </div>
);

export default LoadingState;
