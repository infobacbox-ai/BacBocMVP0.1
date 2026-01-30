import { getSession } from "@saas/auth/lib/server";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { getEntitlements } from "@shared/lib/entitlements-client";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

/**
 * /backbox/start - Start new BackBox project
 * Form to initiate a new trial or paid project
 * Placeholder implementation for Slice 1
 */
export default async function BackBoxStartPage() {
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	// Fetch user entitlements to determine access state
	const entitlements = await getEntitlements();

	// Enforce one-run trial invariant
	if (entitlements.accessState === "NONE") {
		redirect("/access");
	}

	if (entitlements.accessState === "TRIAL_ACTIVE") {
		if (!entitlements.trialProjectId) {
			// This should never happen, but handle gracefully
			redirect("/access");
		}
		redirect(`/backbox/project/${entitlements.trialProjectId}`);
	}

	// Allow access for TRIAL_AVAILABLE or PAID
	const t = await getTranslations();

	// TODO (Slice 1): Implement start form with:
	// - Check entitlements to determine if trial or paid project
	// - Form with sourceText input (max 30,000 chars)
	// - Optional title input (max 120 chars)
	// - Call backbox.startTrialProject or backbox.createPaidProject
	// - Redirect to /backbox/project/[projectId]/p1 on success

	return (
		<div className="container mx-auto py-8">
			<PageHeader
				title={t("backbox.start.title")}
				subtitle={t("backbox.start.subtitle")}
			/>

			<div className="mt-8 rounded-lg border border-border bg-card p-8 text-center">
				<h2 className="text-lg font-semibold">
					{t("backbox.start.placeholder")}
				</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					{t("backbox.start.implementation")}
				</p>
			</div>
		</div>
	);
}
