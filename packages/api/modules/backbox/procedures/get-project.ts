import { ORPCError } from "@orpc/server";
import type { ProjectDetails } from "@repo/shared";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { checkProjectAccess } from "../lib/guards";

/**
 * Input validation schema for getProject
 */
const getProjectInputSchema = z.object({
	projectId: z.string().min(1, "Project ID is required"),
});

/**
 * backbox.getProject (§5.5)
 * Returns full project details including answers and recaps
 *
 * Requirements:
 * - User must be authenticated
 * - User must own the project
 */
export const getProject = protectedProcedure
	.route({
		method: "GET",
		path: "/backbox/projects/{projectId}",
		tags: ["BackBox"],
		summary: "Get project details",
		description:
			"Returns full project details including answers and recaps. User must own the project.",
	})
	.input(getProjectInputSchema)
	.handler(async ({ input, context: { user } }): Promise<ProjectDetails> => {
		const { projectId } = input;

		// Check project access
		const hasAccess = await checkProjectAccess(projectId, user.id);
		if (!hasAccess) {
			throw new ORPCError("NOT_FOUND", {
				message: "Project not found",
			});
		}

		// TODO (Slice 3): Implement actual project retrieval
		// 1. Query project from database
		// 2. Verify ownership
		// 3. Load answers, mini-recaps, and final recap
		// 4. Return ProjectDetails

		if (process.env.NODE_ENV === "development") {
			// Dev mock: Return mock project details
			console.log("[DEV] getProject:", { projectId, userId: user.id });

			// Support loading/empty states based on projectId patterns
			// - "empty-*" returns project with no answers
			// - "loading-*" returns project in initial state
			// - Default returns project with sample data

			const isEmptyProject = projectId.startsWith("empty-");
			const isLoadingProject = projectId.startsWith("loading-");

			const mockProject: ProjectDetails = {
				project: {
					id: projectId,
					title: isLoadingProject
						? undefined
						: isEmptyProject
							? "Empty Project"
							: "Sample Business Idea",
					sourceText: isLoadingProject
						? ""
						: "This is a sample business idea description for testing purposes. It contains enough text to simulate a real project source.",
					mode: "trial",
					currentStep:
						isLoadingProject || isEmptyProject ? "p1" : "p2",
					updatedAt: new Date().toISOString(),
				},
				answers:
					isLoadingProject || isEmptyProject
						? []
						: [
								{
									pillar: "p1",
									fieldKey: "problem_statement",
									content: "Sample problem statement",
								},
								{
									pillar: "p1",
									fieldKey: "target_audience",
									content: "Sample target audience",
								},
							],
				miniRecaps:
					isLoadingProject || isEmptyProject
						? []
						: [
								{
									pillar: "p1",
									output: {
										pillar: "p1",
										score: 75,
										strengths: [
											"Clear problem identification",
											"Well-defined target audience",
										],
										improvements: [
											"Could expand on market size",
											"Add competitive analysis",
										],
										nextAction:
											"Proceed to market validation",
									},
									score: 75,
								},
							],
				finalRecap: null,
			};

			return mockProject;
		}

		// Production stub (will be implemented in Slice 3)
		// Return empty project structure for now
		return {
			project: {
				id: projectId,
				sourceText: "",
				mode: "trial",
				currentStep: "p1",
				updatedAt: new Date().toISOString(),
			},
			answers: [],
			miniRecaps: [],
			finalRecap: null,
		};
	});
