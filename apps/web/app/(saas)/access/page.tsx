import { getSession } from "@saas/auth/lib/server";
import { getEntitlements } from "@shared/lib/entitlements-client";
import { Button } from "@ui/components/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

/**
 * /access - Access gate page
 * Handles routing based on user entitlement state
 * Shows access options when user has no access (NONE state)
 */
export default async function AccessPage() {
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	const t = await getTranslations();

	// Fetch user entitlements to check access state
	const entitlements = await getEntitlements();

	// If user has access, redirect to dashboard
	if (entitlements.accessState !== "NONE") {
		redirect("/backbox");
	}

	// Show minimal access gate UI for Slice 1
	return (
		<div className="container mx-auto py-8">
			<div className="max-w-2xl mx-auto text-center space-y-6">
				<h1 className="text-3xl font-bold">{t("access.title")}</h1>
				<p className="text-lg text-muted-foreground">
					{t("access.description")}
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
					<Button asChild variant="primary">
						<Link href="/backbox/start">
							{t("access.cta.trial")}
						</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/pricing">{t("access.cta.premium")}</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
