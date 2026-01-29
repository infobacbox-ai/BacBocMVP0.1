import type { GetEntitlementsOutput } from "@repo/shared";

/**
 * Validates entitlements data for BackBox Dashboard.
 * Enforces the invariant: TRIAL_ACTIVE must have a trialProjectId.
 */
export function validateEntitlements(
	data: GetEntitlementsOutput,
):
	| { valid: true; data: GetEntitlementsOutput }
	| { valid: false; error: "TRIAL_ACTIVE_MISSING_PROJECT_ID" } {
	// Enforce TRIAL_ACTIVE invariant: must have trialProjectId
	if (data.accessState === "TRIAL_ACTIVE" && !data.trialProjectId) {
		return { valid: false, error: "TRIAL_ACTIVE_MISSING_PROJECT_ID" };
	}

	return { valid: true, data };
}
