import type { GetEntitlementsOutput } from "@repo/shared";
import { protectedProcedure } from "../../../orpc/procedures";

/**
 * me.getEntitlements (§5.1)
 * Returns user entitlements, access state, trial project, quotas, and rate limits
 * Single source of truth for user access control
 */
export const getEntitlements = protectedProcedure
	.route({
		method: "GET",
		path: "/me/entitlements",
		tags: ["Me"],
		summary: "Get user entitlements",
		description:
			"Returns user entitlements, access state, trial info, quotas, and rate limits",
	})
	.handler(
		async ({
			context: { user: _user },
		}): Promise<GetEntitlementsOutput> => {
			// TODO (Slice 3): Implement actual entitlement logic
			// For now, return dev mock data based on NODE_ENV

			if (process.env.NODE_ENV === "development") {
				// Dev mock: Default to TRIAL_AVAILABLE state
				return {
					entitlement_status: "none",
					accessState: "TRIAL_AVAILABLE",
					trialProjectId: null,
					quotas: {
						perPillarMax: 2,
						perPillarUsed: undefined,
					},
					rateLimit: {
						perHourMax: 10,
					},
				};
			}

			// Production stub (will be implemented in Slice 3)
			// This calculates entitlement_status based on:
			// 1. Check if user has active subscription (paid)
			// 2. Check if trial is consumed (trial_one_run)
			// 3. Otherwise, none

			// For now, return safe defaults
			return {
				entitlement_status: "none",
				accessState: "TRIAL_AVAILABLE",
				trialProjectId: null,
				quotas: {
					perPillarMax: 2,
					perPillarUsed: undefined,
				},
				rateLimit: {
					perHourMax: 10,
				},
			};
		},
	);
