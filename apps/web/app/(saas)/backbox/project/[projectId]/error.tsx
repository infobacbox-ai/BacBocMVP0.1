"use client";

import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

/**
 * Error boundary for the BackBox project page
 * Displays error message with retry functionality
 */
export default function ProjectPageError({ error, reset }: ErrorProps) {
	const t = useTranslations("backbox.error.page");

	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] p-6">
			<Alert variant="error" className="max-w-lg">
				<AlertTitle>{t("title")}</AlertTitle>
				<AlertDescription>
					<p className="mt-2">{t("message")}</p>
					{error.digest && (
						<p className="mt-2 text-xs opacity-60">
							{t("code")}: {error.digest}
						</p>
					)}
				</AlertDescription>
			</Alert>
			<div className="flex gap-3 mt-6">
				<Button variant="primary" onClick={reset}>
					{t("retry")}
				</Button>
				<Button variant="outline" asChild>
					<Link href="/backbox">{t("backToDashboard")}</Link>
				</Button>
			</div>
		</div>
	);
}
