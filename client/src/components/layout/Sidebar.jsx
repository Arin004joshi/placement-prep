import {
  BookOpen,
  Gauge,
  Layers,
  ListChecks,
  LogOut,
  RefreshCcw,
  ShieldCheck,
  Tags,
  Target
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/practice", label: "Practice", icon: Target },
  { to: "/revision", label: "Revision", icon: RefreshCcw },
  { to: "/progress", label: "Progress", icon: ListChecks },
  { to: "/subjects", label: "Subjects", icon: BookOpen }
];

const adminItems = [
  { to: "/admin/subjects", label: "Subjects", icon: ShieldCheck },
  { to: "/admin/topics", label: "Topics", icon: Layers },
  { to: "/admin/subtopics", label: "Subtopics", icon: Tags },
  { to: "/admin/questions", label: "Questions", icon: ListChecks }
];

const NavItem = ({ item }) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
          isActive ? "bg-blue-50 text-brand" : "text-muted hover:bg-slate-100 hover:text-ink"
        }`
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {item.label}
    </NavLink>
  );
};

const Sidebar = () => {
  const { isAdmin, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white px-4 py-5 lg:flex lg:flex-col">
      <div className="mb-8">
        <p className="text-lg font-bold text-ink">Interview Prep</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">MAANG readiness</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>

      {isAdmin ? (
        <div className="mt-8">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted">Admin</p>
          <nav className="space-y-1">
            {adminItems.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </nav>
        </div>
      ) : null}

      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start" onClick={logout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
