import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";
import { getSession } from "../services/auth";
import { COMPANY_NAME } from "../data/mockData";
import "../components/ui.css";
import "./Settings.css";

export default function Settings() {
  const { policy, updatePolicy } = useAppData();
  const user = getSession();
  const [saved, setSaved] = useState(false);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const toggleMfa = async () => {
    await updatePolicy({ mfaRequired: !policy.mfaRequired });
    flashSaved();
  };

  const handleSessionExpiry = async (value: number) => {
    await updatePolicy({ sessionExpiryMinutes: value });
    flashSaved();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administração"
        title="Configurações"
        description="Perfil da conta e políticas de segurança aplicadas a toda a organização."
        actions={saved ? <span className="settings__saved">Alterações salvas e registradas na auditoria</span> : undefined}
      />

      <div className="card settings__section">
        <h2 className="section-title">Perfil</h2>
        <div className="settings__profile">
          <div className="settings__avatar">{user?.name?.slice(0, 1) ?? "G"}</div>
          <div>
            <div className="settings__profile-name">{user?.name}</div>
            <div className="settings__profile-meta mono">{user?.email}</div>
            <div className="settings__profile-meta">{user?.role} · {COMPANY_NAME}</div>
          </div>
        </div>
      </div>

      <div className="card settings__section">
        <h2 className="section-title">Políticas de segurança</h2>

        <div className="settings__row">
          <div>
            <div className="settings__row-label">Autenticação multifator obrigatória</div>
            <div className="settings__row-hint">Exige um segundo fator de verificação para todos os administradores.</div>
          </div>
          <button
            className={`settings__toggle ${policy.mfaRequired ? "is-on" : ""}`}
            onClick={toggleMfa}
            role="switch"
            aria-checked={policy.mfaRequired}
          >
            <span className="settings__toggle-knob" />
          </button>
        </div>

        <div className="settings__row">
          <div>
            <div className="settings__row-label">Expiração de sessão</div>
            <div className="settings__row-hint">Tempo de inatividade antes do logout automático.</div>
          </div>
          <select
            className="settings__select"
            value={policy.sessionExpiryMinutes}
            onChange={(e) => handleSessionExpiry(Number(e.target.value))}
          >
            {[15, 30, 60, 120].map((m) => (
              <option key={m} value={m}>
                {m} minutos
              </option>
            ))}
          </select>
        </div>

        <div className="settings__row">
          <div>
            <div className="settings__row-label">Tamanho mínimo de senha</div>
            <div className="settings__row-hint">Aplicado a todas as contas na criação e troca de senha.</div>
          </div>
          <span className="settings__static-value mono">{policy.passwordMinLength} caracteres</span>
        </div>

        <div className="settings__row">
          <div>
            <div className="settings__row-label">Rotação de senha</div>
            <div className="settings__row-hint">Intervalo obrigatório para troca de senha.</div>
          </div>
          <span className="settings__static-value mono">{policy.passwordRotationDays} dias</span>
        </div>
      </div>
    </div>
  );
}
