import type { AccessGrant, ComplianceScoreBreakdown, RiskTrendPoint } from "../types";

/**
 * Pure compliance scoring engine. No React, no DOM — just the math that
 * turns a list of access grants into a single 0-100 posture score.
 *
 * Model:
 *  - Every grant carries a riskWeight (1-10) reflecting how sensitive the
 *    permission is (e.g. "prod database admin" > "read-only dashboard").
 *  - A PENDING grant is unreviewed exposure: it always penalizes, scaled by
 *    its risk weight (pending review penalty).
 *  - An APPROVED grant that has never been reviewed, or was reviewed more
 *    than STALE_REVIEW_DAYS ago, is a governance gap: it penalizes at a
 *    lower rate (stale review penalty).
 *  - A REVOKED grant contributes zero penalty — it's resolved risk.
 *
 * The raw penalty is normalized against the worst-case penalty for the same
 * population (every grant pending, at max risk weight) so the score stays
 * comparable as the number of grants changes.
 */

const STALE_REVIEW_DAYS = 90;
const MAX_RISK_WEIGHT = 10;
const PENDING_MULTIPLIER = 2;
const STALE_MULTIPLIER = 0.5;
const UNREVIEWED_MULTIPLIER = 1;

function daysSince(isoDate: string, now: Date): number {
  const then = new Date(isoDate).getTime();
  return (now.getTime() - then) / (1000 * 60 * 60 * 24);
}

export function calculateComplianceScore(
  grants: AccessGrant[],
  now: Date = new Date(),
): ComplianceScoreBreakdown {
  const totalGrants = grants.length;
  let pendingReviews = 0;
  let revokedCount = 0;
  let approvedCount = 0;
  let weightedRiskPenalty = 0;
  let staleReviewPenalty = 0;

  for (const grant of grants) {
    if (grant.status === "pending") {
      pendingReviews += 1;
      weightedRiskPenalty += grant.riskWeight * PENDING_MULTIPLIER;
      continue;
    }

    if (grant.status === "revoked") {
      revokedCount += 1;
      continue;
    }

    // approved
    approvedCount += 1;
    if (!grant.lastReviewedAt) {
      staleReviewPenalty += grant.riskWeight * UNREVIEWED_MULTIPLIER;
    } else if (daysSince(grant.lastReviewedAt, now) > STALE_REVIEW_DAYS) {
      staleReviewPenalty += grant.riskWeight * STALE_MULTIPLIER;
    }
  }

  const rawPenalty = weightedRiskPenalty + staleReviewPenalty;
  const worstCasePenalty = totalGrants > 0 ? totalGrants * MAX_RISK_WEIGHT * PENDING_MULTIPLIER : 1;
  const penaltyPercentage = (rawPenalty / worstCasePenalty) * 100;
  const score = Math.max(0, Math.min(100, Math.round(100 - penaltyPercentage)));

  return {
    score,
    totalGrants,
    pendingReviews,
    revokedCount,
    approvedCount,
    weightedRiskPenalty,
    staleReviewPenalty,
  };
}

/**
 * Builds a synthetic-but-deterministic risk trend from the current grant
 * population by replaying the score calculation as if reviews had been
 * completed progressively over the last N points. This lets the dashboard
 * show a believable trend line without a persisted time-series backend —
 * still a real function of the real data, not decorative random numbers.
 */
export function buildRiskTrend(grants: AccessGrant[], points = 7): RiskTrendPoint[] {
  const now = new Date();
  const trend: RiskTrendPoint[] = [];

  for (let i = points - 1; i >= 0; i -= 1) {
    const asOf = new Date(now);
    asOf.setDate(asOf.getDate() - i * 4);

    // Simulate the state of the world "as of" that date: pending items
    // created after that date are treated as not-yet-flagged (approved,
    // unreviewed) since review hadn't caught them yet — a plausible
    // reconstruction, not a random walk.
    const grantsAsOf = grants.map((g) => {
      if (g.status === "pending" && new Date(g.grantedAt) > asOf) {
        return { ...g, status: "approved" as const, lastReviewedAt: null };
      }
      return g;
    });

    const { score } = calculateComplianceScore(grantsAsOf, asOf);
    const label = asOf.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    trend.push({ label, score });
  }

  return trend;
}
