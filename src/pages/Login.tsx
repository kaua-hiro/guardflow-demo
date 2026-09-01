import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { attemptLogin, createSession, verifyTwoFactorCode, DEMO_CREDENTIALS } from "../services/auth";
import { useAppData } from "../context/AppDataContext";
import "./Login.css";

type Step = "credentials" | "twofactor";

export default function Login() {
  const navigate = useNavigate();
  const { recordLoginEvents } = useAppData();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCredentials = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = attemptLogin(email, password);
    if (!result.ok) {
      setError(result.error ?? "Erro ao autenticar.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("twofactor");
    }, 500);
  };

  const handleTwoFactor = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = verifyTwoFactorCode(code);
    if (!result.ok) {
      setError(result.error ?? "Código inválido.");
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      const user = createSession();
      await recordLoginEvents(user.name);
      setLoading(false);
      navigate("/", { replace: true });
    }, 500);
  };

  return (
    <main className="login">
      <div className="login__panel">
        <div className="login__brand">
          <ShieldMark />
          <span>
            Guard<b>Flow</b>
          </span>
        </div>

        <div className="login__card">
          {step === "credentials" ? (
            <>
              <span className="login__step">Passo 1 de 2</span>
              <h1>Acessar o painel</h1>
              <p className="login__sub">Entre com as credenciais da sua organização.</p>

              <form onSubmit={handleCredentials} className="login__form">
                <label>
                  <span>E-mail corporativo</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  <span>Senha</span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </label>

                {error && <div className="login__error">{error}</div>}

                <button className="login__submit" type="submit" disabled={loading}>
                  {loading ? "Verificando…" : "Continuar"}
                </button>
              </form>

              <div className="login__demo">
                <span>Credenciais de demonstração</span>
                <code>{DEMO_CREDENTIALS.email}</code>
                <code>{DEMO_CREDENTIALS.password}</code>
              </div>
            </>
          ) : (
            <>
              <span className="login__step">Passo 2 de 2</span>
              <h1>Verificação em duas etapas</h1>
              <p className="login__sub">
                Enviamos um código de 6 dígitos para o autenticador vinculado à conta <b>{email}</b>. Em ambiente de demonstração, qualquer código de 6 dígitos é aceito.
              </p>

              <form onSubmit={handleTwoFactor} className="login__form">
                <label>
                  <span>Código de verificação</span>
                  <input
                    id="otp"
                    name="otp"
                    className="login__otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    autoFocus
                    required
                  />
                </label>

                {error && <div className="login__error">{error}</div>}

                <button className="login__submit" type="submit" disabled={loading}>
                  {loading ? "Validando…" : "Confirmar e entrar"}
                </button>
                <button type="button" className="login__back" onClick={() => setStep("credentials")}>
                  Voltar
                </button>
              </form>
            </>
          )}
        </div>

        <p className="login__footnote">Projeto de portfólio — não é um produto SaaS real em produção.</p>
      </div>

      <div className="login__aside" aria-hidden="true">
        <div className="login__aside-glow" />
        <div className="login__aside-grid" />
        <div className="login__aside-content">
          <span className="login__aside-tag">TRILHA DE AUDITORIA</span>
          <p className="login__aside-line mono">a3f9e1c2 → encadeado ✓</p>
          <p className="login__aside-line mono">7b2d44aa → encadeado ✓</p>
          <p className="login__aside-line mono">e19c0f31 → encadeado ✓</p>
          <h2>Cada evento, verificável.</h2>
          <p>
            GuardFlow registra cada aprovação, revogação e alteração de política em uma cadeia de hashes que qualquer
            adulteração quebra de forma detectável — pronto para auditoria SOC 2.
          </p>
        </div>
      </div>
    </main>
  );
}

function ShieldMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
      <path
        d="M32 10 L50 18 V32 C50 44 42.5 51.5 32 55 C21.5 51.5 14 44 14 32 V18 Z"
        stroke="var(--accent)"
        strokeWidth="3.4"
      />
      <path d="M24 32 L29.5 38 L41 25" stroke="var(--accent)" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
