"use client";

import Script, { type ScriptProps } from "next/script";
import type { ComponentType } from "react";

const plausibleUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_URL as string;
const ScriptCompat = Script as unknown as ComponentType<
	ScriptProps & { defer?: boolean }
>;

export function AnalyticsScript() {
	return (
		<ScriptCompat
			defer
			type="text/javascript"
			data-domain={plausibleUrl}
			src="https://plausible.io/js/script.js"
		/>
	);
}

export function useAnalytics() {
	const trackEvent = (event: string, data?: Record<string, unknown>) => {
		if (typeof window === "undefined" || !(window as any).plausible) {
			return;
		}

		(window as any).plausible(event, {
			props: data,
		});
	};

	return {
		trackEvent,
	};
}
