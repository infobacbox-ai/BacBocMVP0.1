"use client";

import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

/**
 * Displays a "not found" screen for BackBox.
 * Shows when a project cannot be found.
 */
export function NotFoundScreen() {
	const t = useTranslations("backbox.error.notFound");

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
