/**
 * BackBox project access guards
 * Shared guard helpers for backbox procedures
 */

/**
 * Check if user has access to a project
 * @param projectId - The project ID to check
 * @param userId - The user ID to verify access for
 * @returns true if user has access, false otherwise
 *
 * TODO (Slice 3): Implement actual database lookup and ownership verification
 */
export async function checkProjectAccess(
	projectId: string,
	userId: string,
): Promise<boolean> {
	// Dev stub: Always return true in development
	if (process.env.NODE_ENV === "development") {
		// Simulate async operation
		await Promise.resolve();
		console.log(
			`[DEV] checkProjectAccess: projectId=${projectId}, userId=${userId}`,
		);
		return true;
	}

	// Production stub (will be implemented in Slice 3)
	// This should:
	// 1. Query the database for the project
	// 2. Verify the project exists
	// 3. Verify the user owns the project
	// For now, return true to allow development
	return true;
}
