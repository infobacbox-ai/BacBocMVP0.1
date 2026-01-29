import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface InternalErrorScreenProps {
	errorCode?: string;
}

/**
 * Displays an internal error screen for BackBox.
 * Shows when data validation fails or unexpected errors occur.
 */
export function InternalErrorScreen({
	errorCode = "INTERNAL_ERROR",
}: InternalErrorScreenProps) {
	const t = useTranslations("backbox.error.internal");

	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] p-6">
			<Alert variant="error" className="max-w-lg">
				<AlertTitle>{t("title")}</AlertTitle>
				<AlertDescription>
					<p className="mt-2">{t("message")}</p>
					<p className="mt-2 text-xs opacity-60">
						{t("code")}: {errorCode}
					</p>
				</AlertDescription>
			</Alert>
			<div className="flex gap-3 mt-6">
				<Button variant="outline" asChild>
					<Link href="/backbox">{t("backToDashboard")}</Link>
				</Button>
				<Button variant="primary" asChild>
					<Link href="/contact">{t("contactSupport")}</Link>
				</Button>
			</div>
		</div>
	);
}
