"use client";

import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

/**
 * Displays a forbidden/access denied screen for BackBox.
 * Shows when user doesn't have ownership or entitlement to access a project.
 */
export function ForbiddenScreen() {
	const t = useTranslations("backbox.error.forbidden");

	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] p-6">
			<Alert variant="error" className="max-w-lg">
				<AlertTitle>{t("title")}</AlertTitle>
				<AlertDescription>
					<p className="mt-2">{t("message")}</p>
				</AlertDescription>
			</Alert>
			<div className="flex gap-3 mt-6">
				<Button variant="outline" asChild>
					<Link href="/backbox">{t("backToDashboard")}</Link>
				</Button>
			</div>
		</div>
	);
}
