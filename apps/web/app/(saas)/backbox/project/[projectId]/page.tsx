import { getSession } from "@saas/auth/lib/server";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

interface BackBoxProjectPageProps {
	params: Promise<{
		projectId: string;
	}>;
}

/**
 * /backbox/project/[projectId] - BackBox project view
 * Shows project details and wizard navigation
 * Placeholder implementation for Slice 1
 */
export default async function BackBoxProjectPage({
	params,
}: BackBoxProjectPageProps) {
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	const { projectId } = await params;
	const t = await getTranslations();

	// TODO (Slice 1): Implement project view with:
	// - Fetch project via backbox.getProject(projectId)
	// - Check ownership and entitlements
	// - Show project info (title, mode, currentStep)
	// - Display wizard navigation (P1, P2, P3, P4, Final)
	// - Show progress indicator
	// - Navigate to current step or allow step selection

	return (
		<div className="container mx-auto py-8">
			<PageHeader
				title={t("backbox.project.title")}
				subtitle={t("backbox.project.id", { id: projectId })}
			/>

			<div className="mt-8 rounded-lg border border-border bg-card p-8 text-center">
				<h2 className="text-lg font-semibold">
					{t("backbox.project.placeholder")}
				</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					{t("backbox.project.implementation")}
				</p>
				<p className="mt-4 text-xs text-muted-foreground">
					Project ID: {projectId}
				</p>
			</div>
		</div>
	);
}
