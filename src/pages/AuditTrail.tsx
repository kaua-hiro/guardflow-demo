import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";
import { shortHash, verifyAuditChain, type ChainVerificationResult } from "../services/auditChain";
import "../components/ui.css";
import "./AuditTrail.css";

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Login",
  LOGIN_2FA_VERIFIED: "2FA verificado",
  ACCESS_APPROVED: "Acesso aprovado",
  ACCESS_REVOKED: "Acesso revogado",
  CHECKLIST_UPDATED: "Checklist atualizado",
  SETTINGS_CHANGED: "Configuração alterada",
  SYSTEM_INIT: "Sistema inicializado",
};

export default function AuditTrail() {
  const { auditLog, auditReady } = useAppData();
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<ChainVerificationResult | null>(null);

  const handleVerify = async () => {
    setVerifying(true);
    setResult(null);
    const res = await verifyAuditChain(auditLog);
    // small artificial delay so the "verifying" state is perceivable — the
    // computation itself is fast, but the UX should read as a real check
    await new Promise((r) => setTimeout(r, 400));
    setResult(res);
    setVerifying(false);
  };

  const reversed = [...auditLog].reverse();

  return (
    <div>
      <PageHeader
        eyebrow="Prova de integridade"
        title="Trilha de auditoria"
        description="Cada evento é encadeado por hash SHA-256 ao evento anterior. Qualquer alteração retroativa quebra a corrente — e a verificação abaixo prova isso recomputando toda a cadeia."
        actions={
          <button className="btn btn--primary" onClick={handleVerify} disabled={verifying || !auditReady}>
            {verifying ? "Verificando cadeia…" : "Verificar integridade"}
          </button>
        }
      />

      {result && (
        <div className={`audit-verify-banner ${result.valid ? "is-valid" : "is-broken"}`}>
          {result.valid ? (
            <>
              <CheckIcon /> Cadeia íntegra: {auditLog.length} eventos verificados, nenhuma adulteração detectada.
            </>
          ) : (
            <>
              <WarnIcon /> Corrente quebrada no evento #{result.brokenAtIndex}. Os hashes não conferem.
            </>
          )}
        </div>
      )}

      <div className="card audit-chain">
        {!auditReady && <p className="empty-state">Inicializando cadeia de auditoria…</p>}

        <ol className="audit-chain__list">
          {reversed.map((event, i) => (
            <li key={event.id} className="audit-chain__item">
              <div className="audit-chain__rail">
                <span className="audit-chain__dot" />
                {i !== reversed.length - 1 && <span className="audit-chain__line" />}
              </div>

              <div className="audit-chain__body">
                <div className="audit-chain__top">
                  <span className={`audit-chain__badge audit-chain__badge--${event.action}`}>
                    {ACTION_LABELS[event.action] ?? event.action}
                  </span>
                  <time className="mono audit-chain__time">
                    {new Date(event.timestamp).toLocaleString("pt-BR")}
                  </time>
                </div>
                <p className="audit-chain__detail">{event.detail}</p>
                <p className="audit-chain__actor">por {event.actor}</p>

                <div className="audit-chain__hashes">
                  <span className="audit-chain__hash-chip mono" title={event.prevHash}>
                    prev {event.index === 0 ? "genesis" : shortHash(event.prevHash)}
                  </span>
                  <span className="audit-chain__chain-arrow">→</span>
                  <span className="audit-chain__hash-chip mono is-self" title={event.hash}>
                    {shortHash(event.hash)}
                  </span>
                  <span className="audit-chain__linked">
                    <CheckIcon small /> encadeado
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function CheckIcon({ small }: { small?: boolean }) {
  const s = small ? 12 : 16;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
      <path d="M10.3 3.9L1.8 18.5a1.5 1.5 0 001.3 2.3h17.8a1.5 1.5 0 001.3-2.3L13.7 3.9a1.5 1.5 0 00-2.6 0z" />
    </svg>
  );
}
