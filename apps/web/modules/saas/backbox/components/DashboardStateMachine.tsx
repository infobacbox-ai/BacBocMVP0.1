import type { GetEntitlementsOutput } from "@repo/shared";
import { InternalErrorScreen } from "./InternalErrorScreen";
import { validateEntitlements } from "../lib/validate-entitlements";

interface DashboardStateMachineProps {
	entitlements: GetEntitlementsOutput;
}

/**
 * Dashboard State Machine
 * Maps accessState to deterministic UI states.
 * Enforces TRIAL_ACTIVE invariant via validation.
 */
export function DashboardStateMachine({
	entitlements,
}: DashboardStateMachineProps) {
	// Validate entitlements first
	const validation = validateEntitlements(entitlements);

	if (!validation.valid) {
		return <InternalErrorScreen errorCode={validation.error} />;
	}

	// Exhaustive switch on accessState
	switch (entitlements.accessState) {
		case "NONE":
			// Should never reach here - handled at route level
			return (
				<div className="p-6">
					<p className="text-muted-foreground">
						Redirecting to access gate...
					</p>
				</div>
			);

		case "TRIAL_AVAILABLE":
			return (
				<div className="p-6">
					<h2 className="text-2xl font-bold mb-4">Trial Available</h2>
					<p className="text-muted-foreground">
						State: TRIAL_AVAILABLE (Placeholder - Will be implemented in
						PR 3)
					</p>
				</div>
			);

		case "TRIAL_ACTIVE":
			return (
				<div className="p-6">
					<h2 className="text-2xl font-bold mb-4">Trial Active</h2>
					<p className="text-muted-foreground">
						State: TRIAL_ACTIVE
						<br />
						Project ID: {entitlements.trialProjectId}
						<br />
						(Placeholder - Will be implemented in PR 3)
					</p>
				</div>
			);

		case "PAID":
			return (
				<div className="p-6">
					<h2 className="text-2xl font-bold mb-4">Premium</h2>
					<p className="text-muted-foreground">
						State: PAID (Placeholder - Will be implemented in PR 3)
					</p>
				</div>
			);

		default: {
			// TypeScript exhaustiveness check
			const _exhaustive: never = entitlements.accessState;
			return <InternalErrorScreen errorCode="UNKNOWN_ACCESS_STATE" />;
		}
	}
}
