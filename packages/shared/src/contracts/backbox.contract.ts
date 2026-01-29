/**
 * BackBox MVP Contract Types (Canonical)
 * Based on Contract Spec v0.4 (2026-01-23)
 * Source: IMPORTANT SOURCE OF TRUTH + DOCS/3. BackBox MVP — Contract Spec (Artifact 3) (1).md
 */

/**
 * Entitlement status (§0.1)
 * - none: No active subscription AND trial not consumed
 * - trial_one_run: Trial consumed (one trial project exists) OR trial in progress
 * - paid: Active subscription
 *
 * IMPORTANT: Never use "trial" as an entitlement value. "trial" only exists as a project mode.
 */
export type EntitlementStatus = "none" | "trial_one_run" | "paid";

/**
 * Access state (§0.2) - Derived for UI
 * - NONE: Not authenticated
 * - TRIAL_AVAILABLE: Authenticated, not paid, trial not consumed
 * - TRIAL_ACTIVE: Authenticated, not paid, trial project exists
 * - PAID: Active subscription
 */
export type AccessState = "NONE" | "TRIAL_AVAILABLE" | "TRIAL_ACTIVE" | "PAID";

/**
 * Project mode (§0.3)
 */
export type ProjectMode = "trial" | "paid";

/**
 * Pillar identifier (§0.3)
 */
export type Pillar = "p1" | "p2" | "p3" | "p4";

/**
 * Project current step
 */
export type ProjectStep = Pillar | "final";

/**
 * Error codes (§4.1)
 */
export const ERROR_CODES = {
	VALIDATION_ERROR: "VALIDATION_ERROR",
	UNAUTHENTICATED: "UNAUTHENTICATED",
	FORBIDDEN: "FORBIDDEN",
	NOT_FOUND: "NOT_FOUND",
	FINAL_REQUIRED: "FINAL_REQUIRED",
	QUOTA_REACHED: "QUOTA_REACHED",
	RATE_LIMIT: "RATE_LIMIT",
	EVALUATION_IN_PROGRESS: "EVALUATION_IN_PROGRESS",
	AI_UNAVAILABLE: "AI_UNAVAILABLE",
	INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * API Error structure (§4.1)
 */
export interface ApiError {
	status: 400 | 401 | 403 | 404 | 409 | 429 | 500;
	errorCode: ErrorCode;
	message: string;
	details?: Record<string, unknown>;
}

/**
 * me.getEntitlements output (§5.1)
 * Single source of truth for user entitlements and quotas
 */
export interface GetEntitlementsOutput {
	entitlement_status: EntitlementStatus;
	accessState: AccessState;
	trialProjectId: string | null;
	quotas: {
		perPillarMax: number;
		perPillarUsed?: Record<Pillar, number>;
	};
	rateLimit: {
		perHourMax: number;
	};
}

/**
 * Mini-recap output (§6.1)
 */
export interface MiniRecapOutput {
	pillar: Pillar;
	score?: number; // 0..100 (optional)
	strengths: string[]; // 0..2
	improvements: string[]; // 0..2
	nextAction: string;
}

/**
 * Final recap output (§6.2)
 */
export interface FinalRecapOutput {
	priorities: string[]; // 1..3 priority actions
	perPillar: Record<
		Pillar,
		{
			score?: number;
			strengths: string[];
			improvements: string[];
			nextAction: string;
		}
	>;
}

/**
 * Project summary for listing (§5.4)
 */
export interface ProjectSummary {
	id: string;
	title?: string;
	mode: ProjectMode;
	currentStep: ProjectStep;
	updatedAt: string;
}

/**
 * Full project details (§5.5)
 */
export interface ProjectDetails {
	project: {
		id: string;
		title?: string;
		sourceText: string;
		mode: ProjectMode;
		currentStep: ProjectStep;
		updatedAt: string;
	};
	answers: Array<{
		pillar: Pillar;
		fieldKey: string;
		content: unknown;
	}>;
	miniRecaps: Array<{
		pillar: Pillar;
		output: MiniRecapOutput;
		score?: number;
	}>;
	finalRecap: { output: FinalRecapOutput } | null;
}
