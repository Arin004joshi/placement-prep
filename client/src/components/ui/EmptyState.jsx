import { Inbox } from "lucide-react";

const EmptyState = ({ title = "No data yet", message = "Content will appear here once it is available." }) => (
  <div className="flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed border-line bg-white px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900">
    <Inbox className="mb-3 h-8 w-8 text-muted" aria-hidden="true" />
    <h2 className="text-base font-semibold text-ink dark:text-slate-100">{title}</h2>
    <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
  </div>
);

export default EmptyState;
