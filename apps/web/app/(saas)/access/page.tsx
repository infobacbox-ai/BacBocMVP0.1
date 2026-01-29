import { getSession } from "@saas/auth/lib/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

/**
 * /access - Access gate page
 * Handles routing based on user entitlement state
 * Placeholder implementation for Slice 1
 */
export default async function AccessPage() {
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	const t = await getTranslations();

	// TODO (Slice 1): Implement access gate logic based on entitlements
	// For now, redirect to BackBox dashboard
	redirect("/backbox");

	return (
		<div className="container mx-auto py-8">
			<h1 className="text-2xl font-bold">
				{t("access.title", "Access")}
			</h1>
			<p className="text-muted-foreground">
				{t("access.description", "Checking your access...")}
			</p>
		</div>
	);
}
