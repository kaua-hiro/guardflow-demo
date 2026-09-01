import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusPill from "../components/StatusPill";
import { useAppData } from "../context/AppDataContext";
import type { AccessStatus } from "../types";
import "../components/ui.css";
import "./AccessReview.css";

type Filter = "all" | AccessStatus;

export default function AccessReview() {
  const { grants, approveGrant, revokeGrant, scoreBreakdown } = useAppData();
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return grants;
    return grants.filter((g) => g.status === filter);
  }, [grants, filter]);

  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (b.status === "pending" && a.status !== "pending") return 1;
    return b.riskWeight - a.riskWeight;
  });

  const handle = async (action: "approve" | "revoke", id: string) => {
    setBusyId(id);
    try {
      if (action === "approve") await approveGrant(id);
      else await revokeGrant(id);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Governança de acesso"
        title="Revisão de acessos"
        description="Aprove ou revogue permissões concedidas. Cada ação recalcula o score de compliance e gera um evento na trilha de auditoria."
        actions={
          <div className="stat-card" style={{ minWidth: 200 }}>
            <span className="stat-card__label">Score atual</span>
            <span className="stat-card__value accent">{scoreBreakdown.score}<small>/100</small></span>
          </div>
        }
      />

      <div className="access-review__filters">
        {(["all", "pending", "approved", "revoked"] as Filter[]).map((f) => (
          <button
            key={f}
            className={`access-review__filter ${filter === f ? "is-active" : ""}`}
            onClick={() => setFilter(f)}
            type="button"
          >
            {f === "all" ? "Todos" : f === "pending" ? "Pendentes" : f === "approved" ? "Aprovados" : "Revogados"}
          </button>
        ))}
      </div>

      <div className="card access-review__table-card">
        <div className="access-review__table-wrap scrollbar">
          <table className="access-review__table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Departamento</th>
                <th>Sistema</th>
                <th>Permissão</th>
                <th>Risco</th>
                <th>Última revisão</th>
                <th>Status</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((g) => (
                <tr key={g.id}>
                  <td>
                    <div className="access-review__user">
                      <span>{g.userName}</span>
                      <span className="access-review__email mono">{g.userEmail}</span>
                    </div>
                  </td>
                  <td>{g.department}</td>
                  <td>{g.system}</td>
                  <td>{g.permission}</td>
                  <td>
                    <span className={`access-review__risk mono ${g.riskWeight >= 8 ? "is-high" : g.riskWeight >= 5 ? "is-mid" : ""}`}>
                      {g.riskWeight}/10
                    </span>
                  </td>
                  <td className="mono access-review__date">
                    {g.lastReviewedAt ? new Date(g.lastReviewedAt).toLocaleDateString("pt-BR") : "nunca"}
                  </td>
                  <td>
                    <StatusPill status={g.status} />
                  </td>
                  <td>
                    <div className="access-review__actions">
                      {g.status !== "approved" && (
                        <button
                          className="btn btn--approve"
                          disabled={busyId === g.id}
                          onClick={() => handle("approve", g.id)}
                        >
                          Aprovar
                        </button>
                      )}
                      {g.status !== "revoked" && (
                        <button
                          className="btn btn--revoke"
                          disabled={busyId === g.id}
                          onClick={() => handle("revoke", g.id)}
                        >
                          Revogar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-state">
                    Nenhum acesso encontrado para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
