import { Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Topbar = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu className="h-5 w-5 text-muted lg:hidden" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-ink dark:text-slate-100">Preparation Workspace</p>
            <p className="text-xs text-muted">Structured CS fundamentals and MERN interview content</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-ink dark:text-slate-100">{user?.name}</p>
          <p className="text-xs capitalize text-muted">{user?.role}</p>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
