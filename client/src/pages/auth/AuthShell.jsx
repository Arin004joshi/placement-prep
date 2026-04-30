import { BookOpenCheck } from "lucide-react";

const AuthShell = ({ children, title, subtitle }) => (
  <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
    <div className="grid min-h-screen lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-ink px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-brand">
              <BookOpenCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xl font-bold">Interview Prep</p>
              <p className="text-sm text-slate-300">MAANG readiness platform</p>
            </div>
          </div>
        </div>
        <div className="max-w-2xl">
          <p className="text-4xl font-bold leading-tight">
            Build interview depth across DBMS, OOPs, OS, and MERN.
          </p>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Phase 1 connects authentication, content browsing, and admin-managed learning material.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-md border border-line bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ink dark:text-slate-100">{title}</h1>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </div>
  </main>
);

export default AuthShell;
