import { BACKBOX_VALIDATION } from "@repo/shared";
import { nanoid } from "nanoid";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

/**
 * Input validation schema for startTrialProject
 * - sourceText: 1-30000 characters (required)
 * - title: max 120 characters (optional)
 * - sourceMeta: additional metadata (optional)
 */
const startTrialInputSchema = z.object({
	sourceText: z
		.string()
		.min(
			BACKBOX_VALIDATION.SOURCE_TEXT_MIN_LENGTH,
			"Source text is required",
		)
		.max(
			BACKBOX_VALIDATION.SOURCE_TEXT_MAX_LENGTH,
			`Source text must be ${BACKBOX_VALIDATION.SOURCE_TEXT_MAX_LENGTH} characters or less`,
		),
	title: z
		.string()
		.max(
			BACKBOX_VALIDATION.TITLE_MAX_LENGTH,
			`Title must be ${BACKBOX_VALIDATION.TITLE_MAX_LENGTH} characters or less`,
		)
		.optional(),
	sourceMeta: z.record(z.string(), z.unknown()).optional(),
});

/**
 * backbox.startTrialProject (§5.2)
 * Creates a new trial project from source text
 *
 * Requirements:
 * - User must be authenticated
 * - User must have trial available (not consumed)
 * - Validates input text length
 */
export const startTrialProject = protectedProcedure
	.route({
		method: "POST",
		path: "/backbox/trial",
		tags: ["BackBox"],
		summary: "Start a trial project",
		description:
			"Creates a new trial project from source text. User must have trial available.",
	})
	.input(startTrialInputSchema)
	.handler(async ({ input, context: { user: _user } }) => {
		// TODO (Slice 3): Implement actual trial project creation
		// 1. Check user entitlements (trial not consumed)
		// 2. Create project in database
		// 3. Store source text
		// 4. Update user entitlement to trial_one_run
		// 5. Return project ID

		if (process.env.NODE_ENV === "development") {
			// Dev mock: Return mock project ID
			const projectId = `mock-project-${nanoid()}`;

			console.log("[DEV] startTrialProject:", {
				projectId,
				titleLength: input.title?.length,
				sourceTextLength: input.sourceText.length,
				hasSourceMeta: !!input.sourceMeta,
			});

			return {
				projectId,
			};
		}

		// Production stub (will be implemented in Slice 3)
		// For now, return a mock ID to allow development
		return {
			projectId: `mock-project-${nanoid()}`,
		};
	});
