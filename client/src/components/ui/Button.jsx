const variants = {
  primary: "bg-brand text-white hover:bg-blue-700 focus:ring-blue-200",
  secondary:
    "bg-white text-ink border border-line hover:bg-slate-50 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-200",
  ghost: "text-muted hover:bg-slate-100 focus:ring-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
};

const Button = ({ children, className = "", variant = "primary", type = "button", ...props }) => (
  <button
    type={type}
    className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
