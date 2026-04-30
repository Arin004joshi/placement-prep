const Select = ({ label, error, children, className = "", ...props }) => (
  <label className="block">
    {label ? <span className="mb-1 block text-sm font-medium text-ink dark:text-slate-100">{label}</span> : null}
    <select
      className={`min-h-10 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-950 ${className}`}
      {...props}
    >
      {children}
    </select>
    {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
  </label>
);

export default Select;
