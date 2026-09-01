import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../services/auth";
import "./AppShell.css";

const NAV_ITEMS = [
  { to: "/", label: "Visão geral", icon: IconGrid, end: true },
  { to: "/acessos", label: "Revisão de acessos", icon: IconShieldCheck },
  { to: "/auditoria", label: "Trilha de auditoria", icon: IconLink },
  { to: "/checklist", label: "Checklist de compliance", icon: IconList },
  { to: "/configuracoes", label: "Configurações", icon: IconGear },
];

export default function AppShell() {
  const navigate = useNavigate();
  const user = getSession();

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div className="shell__brand">
          <span className="shell__brand-mark" aria-hidden="true">
            <IconShieldCheck size={20} />
          </span>
          <span className="shell__brand-name">
            Guard<span>Flow</span>
          </span>
        </div>

        <nav className="shell__nav" aria-label="Navegação principal">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) => "shell__nav-item" + (isActive ? " is-active" : "")}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="shell__footer">
          <div className="shell__user">
            <div className="shell__avatar">{initials(user?.name ?? "GF")}</div>
            <div className="shell__user-meta">
              <span className="shell__user-name">{user?.name ?? "Convidado"}</span>
              <span className="shell__user-role">{user?.role ?? ""}</span>
            </div>
          </div>
          <button className="shell__logout" onClick={handleLogout} type="button">
            <IconLogout size={16} />
            Sair
          </button>
        </div>
      </aside>

      <main className="shell__main scrollbar">
        <Outlet />
        <footer className="shell__legal">
          <p>
            <strong>Nortis Tecnologia Ltda.</strong> (dado fictício) · CNPJ 00.000.000/0001-00
            (fictício) · contato@nortis.example.com (fictício)
          </p>
          <p>
            GuardFlow é um projeto de demonstração de portfólio desenvolvido por{" "}
            <strong>Kauã Hiro Mizumoto</strong>. Nenhum dado exibido é real.
          </p>
        </footer>
      </main>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

type IconProps = { size?: number };

function IconGrid({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function IconShieldCheck({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLink({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 15l6-6" strokeLinecap="round" />
      <path d="M11 6l1-1a4 4 0 015.5 5.5l-1 1" strokeLinecap="round" />
      <path d="M13 18l-1 1A4 4 0 016.5 13.5l1-1" strokeLinecap="round" />
    </svg>
  );
}

function IconList({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
      <path d="M4.5 6l.8.8L6.5 5.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 12l.8.8 1.2-1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 18l.8.8 1.2-1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGear({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 13.5a7.6 7.6 0 000-3l1.8-1.4-2-3.4-2.1.6a7.7 7.7 0 00-2.6-1.5L14 2.5h-4l-.5 2.3a7.7 7.7 0 00-2.6 1.5l-2.1-.6-2 3.4L4.6 10.5a7.6 7.6 0 000 3L2.8 15l2 3.4 2.1-.6a7.7 7.7 0 002.6 1.5l.5 2.2h4l.5-2.2a7.7 7.7 0 002.6-1.5l2.1.6 2-3.4z" />
    </svg>
  );
}

function IconLogout({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
