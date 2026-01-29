import { getSession } from "@saas/auth/lib/server";
import { DashboardStateMachine } from "@saas/backbox/components/DashboardStateMachine";
import { getEntitlements } from "@shared/lib/entitlements-client";
import { redirect } from "next/navigation";

/**
 * /backbox - BackBox dashboard
 * Main entry point for BackBox application
 * Shows project list and access state based on user entitlements
 */
export default async function BackBoxDashboardPage() {
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	// Fetch user entitlements to determine access state
	const entitlements = await getEntitlements();

	// If no access, redirect to access gate
	if (entitlements.accessState === "NONE") {
		redirect("/access");
	}

	// Render state machine with entitlements
	return <DashboardStateMachine entitlements={entitlements} />;
}
