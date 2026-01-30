"use client";

import Script from "next/script";
import type { ComponentType } from "react";

const plausibleUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_URL as string;
type ScriptCompatProps = {
	src: string;
	defer?: boolean;
	[key: string]: unknown;
};
const ScriptCompat = Script as unknown as ComponentType<ScriptCompatProps>;

export function AnalyticsScript() {
	return (
		<ScriptCompat
			defer
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
