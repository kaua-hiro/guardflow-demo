import type { AccessStatus } from "../types";

const LABELS: Record<AccessStatus, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  revoked: "Revogado",
};

export default function StatusPill({ status }: { status: AccessStatus }) {
  return <span className={`pill pill--${status}`}>{LABELS[status]}</span>;
}
