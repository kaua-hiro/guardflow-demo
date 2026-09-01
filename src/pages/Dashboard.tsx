import { useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import RiskTrendChart from "../components/RiskTrendChart";
import StatusPill from "../components/StatusPill";
import { useAppData } from "../context/AppDataContext";
import { buildRiskTrend } from "../services/complianceScore";
import "../components/ui.css";
import "./Dashboard.css";

export default function Dashboard() {
  const { grants, scoreBreakdown, checklist } = useAppData();
  const trend = useMemo(() => buildRiskTrend(grants), [grants]);

  const pendingGrants = grants.filter((g) => g.status === "pending").sort((a, b) => b.riskWeight - a.riskWeight);
  const checklistDone = checklist.filter((c) => c.done).length;

  const scoreTier =
    scoreBreakdown.score >= 85 ? "accent" : scoreBreakdown.score >= 60 ? "warn" : "danger";

  return (
    <div>
      <PageHeader
        eyebrow="Visão geral"
        title="Postura de compliance"
        description="Score calculado em tempo real a partir das concessões de acesso ativas, revisões pendentes e itens de checklist."
      />

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__label">Score de compliance</span>
          <span className={`stat-card__value ${scoreTier}`}>
            {scoreBreakdown.score}
            <small>/ 100</small>
          </span>
          <span className="stat-card__hint">
            Penalidade de risco: {scoreBreakdown.weightedRiskPenalty.toFixed(1)} · Penalidade de revisões antigas:{" "}
            {scoreBreakdown.staleReviewPenalty.toFixed(1)}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Revisões pendentes</span>
          <span className={`stat-card__value ${pendingGrants.length > 0 ? "warn" : ""}`}>{scoreBreakdown.pendingReviews}</span>
          <span className="stat-card__hint">de {scoreBreakdown.totalGrants} concessões de acesso ativas</span>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Acessos revogados</span>
          <span className="stat-card__value">{scoreBreakdown.revokedCount}</span>
          <span className="stat-card__hint">risco eliminado neste ciclo</span>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Checklist SOC 2 / ISO / LGPD</span>
          <span className="stat-card__value">
            {checklistDone}
            <small>/ {checklist.length}</small>
          </span>
          <span className="stat-card__hint">
            <Link to="/checklist" className="dashboard__link">
              ver itens pendentes →
            </Link>
          </span>
        </div>
      </div>

      <div className="dashboard__grid">
        <div className="card">
          <h2 className="section-title">Tendência do score (últimas semanas)</h2>
          <RiskTrendChart points={trend} />
        </div>

        <div className="card">
          <h2 className="section-title">Alertas de revisão pendente</h2>
          {pendingGrants.length === 0 ? (
            <p className="empty-state">Nenhuma revisão pendente. Tudo em dia.</p>
          ) : (
            <ul className="dashboard__alerts">
              {pendingGrants.slice(0, 5).map((g) => (
                <li key={g.id}>
                  <div>
                    <strong>{g.userName}</strong>
                    <span className="dashboard__alert-meta">
                      {g.system} · {g.permission}
                    </span>
                  </div>
                  <div className="dashboard__alert-side">
                    <span className="dashboard__risk mono">risco {g.riskWeight}/10</span>
                    <StatusPill status={g.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {pendingGrants.length > 0 && (
            <Link to="/acessos" className="dashboard__link dashboard__cta">
              Revisar agora →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
