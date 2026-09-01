import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AccessGrant, AuditEvent, ChecklistItem, SecurityPolicy } from "../types";
import { initialAccessGrants, initialChecklist, defaultSecurityPolicy } from "../data/mockData";
import { appendAuditEvent } from "../services/auditChain";
import { calculateComplianceScore } from "../services/complianceScore";
import { getSession } from "../services/auth";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../services/storage";

interface AppDataContextValue {
  grants: AccessGrant[];
  checklist: ChecklistItem[];
  policy: SecurityPolicy;
  auditLog: AuditEvent[];
  scoreBreakdown: ReturnType<typeof calculateComplianceScore>;
  approveGrant: (id: string) => Promise<void>;
  revokeGrant: (id: string) => Promise<void>;
  toggleChecklistItem: (id: string) => Promise<void>;
  updatePolicy: (partial: Partial<SecurityPolicy>) => Promise<void>;
  recordLoginEvents: (actor: string) => Promise<void>;
  auditReady: boolean;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [grants, setGrants] = useState<AccessGrant[]>(() => loadJSON(STORAGE_KEYS.grants, initialAccessGrants));
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => loadJSON(STORAGE_KEYS.checklist, initialChecklist));
  const [policy, setPolicy] = useState<SecurityPolicy>(() => loadJSON(STORAGE_KEYS.policy, defaultSecurityPolicy));
  const [auditLog, setAuditLog] = useState<AuditEvent[]>(() => loadJSON<AuditEvent[]>(STORAGE_KEYS.auditLog, []));
  const [auditReady, setAuditReady] = useState(auditLog.length > 0);

  // Persist every slice to localStorage whenever it changes, so a refresh
  // doesn't erase approvals, checklist progress or the audit trail.
  useEffect(() => saveJSON(STORAGE_KEYS.grants, grants), [grants]);
  useEffect(() => saveJSON(STORAGE_KEYS.checklist, checklist), [checklist]);
  useEffect(() => saveJSON(STORAGE_KEYS.policy, policy), [policy]);
  useEffect(() => saveJSON(STORAGE_KEYS.auditLog, auditLog), [auditLog]);

  // Seed the chain with a genesis system event on first mount, unless a
  // previous session already persisted one.
  useEffect(() => {
    if (auditLog.length > 0) {
      setAuditReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const genesisEvent = await appendAuditEvent([], {
        action: "SYSTEM_INIT",
        actor: "system",
        detail: "GuardFlow inicializado para Nortis Tecnologia Ltda.",
      });
      if (!cancelled) {
        setAuditLog([genesisEvent]);
        setAuditReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // appendAuditEvent is async (it awaits crypto.subtle.digest), so two
  // appends fired close together (e.g. LOGIN then LOGIN_2FA_VERIFIED) could
  // both read the chain before either commits, computing their hash off the
  // same prevHash and corrupting the chain. chainRef always holds the latest
  // committed chain, and appendQueueRef serializes appends so each one only
  // starts hashing after the previous one has fully committed.
  const chainRef = useRef<AuditEvent[]>(auditLog);
  useEffect(() => {
    chainRef.current = auditLog;
  }, [auditLog]);

  const appendQueueRef = useRef<Promise<void>>(Promise.resolve());

  const appendToChain = useCallback((input: Parameters<typeof appendAuditEvent>[1]) => {
    const next = appendQueueRef.current.then(async () => {
      const event = await appendAuditEvent(chainRef.current, input);
      const updated = [...chainRef.current, event];
      chainRef.current = updated;
      setAuditLog(updated);
    });
    appendQueueRef.current = next;
    return next;
  }, []);

  const actorName = () => getSession()?.name ?? "usuário desconhecido";

  const approveGrant = useCallback(async (id: string) => {
    const grant = grants.find((g) => g.id === id);
    setGrants((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: "approved", lastReviewedAt: new Date().toISOString() } : g)),
    );
    await appendToChain({
      action: "ACCESS_APPROVED",
      actor: actorName(),
      detail: grant ? `Aprovado: ${grant.userName} em ${grant.system} (${grant.permission})` : `Aprovado: ${id}`,
    });
  }, [grants, appendToChain]);

  const revokeGrant = useCallback(async (id: string) => {
    const grant = grants.find((g) => g.id === id);
    setGrants((prev) => prev.map((g) => (g.id === id ? { ...g, status: "revoked" } : g)));
    await appendToChain({
      action: "ACCESS_REVOKED",
      actor: actorName(),
      detail: grant ? `Revogado: ${grant.userName} em ${grant.system} (${grant.permission})` : `Revogado: ${id}`,
    });
  }, [grants, appendToChain]);

  const toggleChecklistItem = useCallback(async (id: string) => {
    const item = checklist.find((c) => c.id === id);
    setChecklist((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
    await appendToChain({
      action: "CHECKLIST_UPDATED",
      actor: actorName(),
      detail: item ? `Item "${item.label}" marcado como ${!item.done ? "concluído" : "pendente"}` : `Item ${id} atualizado`,
    });
  }, [checklist, appendToChain]);

  const updatePolicy = useCallback(async (partial: Partial<SecurityPolicy>) => {
    setPolicy((prev) => ({ ...prev, ...partial }));
    await appendToChain({
      action: "SETTINGS_CHANGED",
      actor: actorName(),
      detail: `Política de segurança atualizada: ${Object.entries(partial)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")}`,
    });
  }, [appendToChain]);

  const recordLoginEvents = useCallback(async (actor: string) => {
    await appendToChain({ action: "LOGIN", actor, detail: "Login com e-mail e senha" });
    await appendToChain({ action: "LOGIN_2FA_VERIFIED", actor, detail: "Segundo fator verificado" });
  }, [appendToChain]);

  const scoreBreakdown = useMemo(() => calculateComplianceScore(grants), [grants]);

  const value: AppDataContextValue = {
    grants,
    checklist,
    policy,
    auditLog,
    scoreBreakdown,
    approveGrant,
    revokeGrant,
    toggleChecklistItem,
    updatePolicy,
    recordLoginEvents,
    auditReady,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
