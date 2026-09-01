import type { AuditEvent, AuditEventInput } from "../types";

/**
 * Tamper-evident audit log, implemented as a real hash chain (the same
 * primitive blockchains and git use): every event's hash is
 * SHA-256(previousHash + canonical(event)). Change or reorder any past
 * event and every hash after it stops matching — that's what
 * verifyChain() proves, by recomputing the whole chain from scratch.
 *
 * Uses the Web Crypto API (crypto.subtle.digest), available in every
 * modern browser context, no external hashing library needed.
 */

export const GENESIS_HASH = "0".repeat(64);

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Deterministic string representation of an event's content, used as the
 * hashing input. Field order is fixed on purpose — canonical form is what
 * makes the hash reproducible. */
function canonicalize(event: {
  index: number;
  timestamp: string;
  action: string;
  actor: string;
  detail: string;
  prevHash: string;
}): string {
  return [event.index, event.timestamp, event.action, event.actor, event.detail, event.prevHash].join("|");
}

export async function appendAuditEvent(
  chain: AuditEvent[],
  input: AuditEventInput,
  timestamp: string = new Date().toISOString(),
): Promise<AuditEvent> {
  const index = chain.length;
  const prevHash = chain.length > 0 ? chain[chain.length - 1].hash : GENESIS_HASH;
  const payload = canonicalize({ index, timestamp, action: input.action, actor: input.actor, detail: input.detail, prevHash });
  const hash = await sha256Hex(payload);

  return {
    id: `evt_${index}_${hash.slice(0, 8)}`,
    index,
    timestamp,
    prevHash,
    hash,
    ...input,
  };
}

export interface ChainVerificationResult {
  valid: boolean;
  brokenAtIndex: number | null;
}

/** Recomputes every hash in the chain from its recorded content and
 * compares against the stored hash + linkage. Returns the first broken
 * link's index, if any. */
export async function verifyAuditChain(chain: AuditEvent[]): Promise<ChainVerificationResult> {
  let expectedPrevHash = GENESIS_HASH;

  for (const event of chain) {
    if (event.prevHash !== expectedPrevHash) {
      return { valid: false, brokenAtIndex: event.index };
    }
    const payload = canonicalize({
      index: event.index,
      timestamp: event.timestamp,
      action: event.action,
      actor: event.actor,
      detail: event.detail,
      prevHash: event.prevHash,
    });
    const recomputedHash = await sha256Hex(payload);
    if (recomputedHash !== event.hash) {
      return { valid: false, brokenAtIndex: event.index };
    }
    expectedPrevHash = event.hash;
  }

  return { valid: true, brokenAtIndex: null };
}

export function shortHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`;
}
