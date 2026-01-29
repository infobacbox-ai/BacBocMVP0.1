import { getSession } from "@saas/auth/lib/server";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

/**
 * /backbox - BackBox dashboard
 * Main entry point for BackBox application
 * Shows project list and access state
 * Placeholder implementation for Slice 1
 */
export default async function BackBoxDashboardPage() {
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	const t = await getTranslations();

	// TODO (Slice 1): Implement dashboard with:
	// - Fetch entitlements via getEntitlements()
	// - Show accessState-based UI (TRIAL_AVAILABLE, TRIAL_ACTIVE, PAID, NONE)
	// - Display project list
	// - Show CTA based on accessState

	return (
		<div className="container mx-auto py-8">
			<PageHeader
				title={t("backbox.dashboard.title", "BackBox Dashboard")}
				subtitle={t(
					"backbox.dashboard.subtitle",
					"Your strategic analysis projects",
				)}
			/>

			<div className="mt-8 rounded-lg border border-border bg-card p-8 text-center">
				<h2 className="text-lg font-semibold">
					{t(
						"backbox.dashboard.placeholder",
						"Dashboard Coming Soon",
					)}
				</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					{t(
						"backbox.dashboard.implementation",
						"This is a placeholder. Implementation will be completed in Slice 1.",
					)}
				</p>
			</div>
		</div>
	);
}
