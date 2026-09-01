// Shared domain types for GuardFlow. Kept framework-agnostic on purpose:
// services/ consume only these types, never React types.

export type AccessStatus = "approved" | "pending" | "revoked";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface AccessGrant {
  id: string;
  userName: string;
  userEmail: string;
  department: string;
  system: string;
  permission: string;
  grantedAt: string; // ISO date
  lastReviewedAt: string | null; // ISO date, null = never reviewed
  status: AccessStatus;
  riskWeight: number; // 1-10, how sensitive this permission is
}

export interface ComplianceScoreBreakdown {
  score: number; // 0-100
  totalGrants: number;
  pendingReviews: number;
  revokedCount: number;
  approvedCount: number;
  weightedRiskPenalty: number;
  staleReviewPenalty: number;
}

export interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  description: string;
  done: boolean;
  framework: "SOC2" | "ISO27001" | "LGPD";
}

export type AuditAction =
  | "LOGIN"
  | "LOGIN_2FA_VERIFIED"
  | "ACCESS_APPROVED"
  | "ACCESS_REVOKED"
  | "CHECKLIST_UPDATED"
  | "SETTINGS_CHANGED"
  | "SYSTEM_INIT";

export interface AuditEventInput {
  action: AuditAction;
  actor: string;
  detail: string;
}

export interface AuditEvent extends AuditEventInput {
  id: string;
  timestamp: string; // ISO date
  prevHash: string;
  hash: string;
  index: number;
}

export interface RiskTrendPoint {
  label: string;
  score: number;
}

export interface AppUser {
  name: string;
  email: string;
  role: string;
  company: string;
}

export interface SecurityPolicy {
  mfaRequired: boolean;
  sessionExpiryMinutes: number;
  passwordMinLength: number;
  passwordRotationDays: number;
}
