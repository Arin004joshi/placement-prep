import { AlertCircle } from "lucide-react";

const ErrorState = ({ title = "Unable to load data", message }) => (
  <div className="flex min-h-32 items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-4 text-red-800">
    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      {message ? <p className="mt-1 text-sm">{message}</p> : null}
    </div>
  </div>
);

export default ErrorState;
