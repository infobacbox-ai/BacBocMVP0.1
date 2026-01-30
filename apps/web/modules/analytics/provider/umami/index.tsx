"use client";

import Script from "next/script";
import type { ComponentType } from "react";

const umamiTrackingId = process.env.NEXT_PUBLIC_UMAMI_TRACKING_ID as string;
type ScriptCompatProps = {
	src: string;
	async?: boolean;
	[key: string]: unknown;
};
const ScriptCompat = Script as unknown as ComponentType<ScriptCompatProps>;

export function AnalyticsScript() {
	return (
		<ScriptCompat
			async
			data-website-id={umamiTrackingId}
			src="https://analytics.eu.umami.is/script.js"
		/>
	);
}

export function useAnalytics() {
	const trackEvent = (event: string, data?: Record<string, unknown>) => {
		if (typeof window === "undefined" || !(window as any).umami) {
			return;
		}

		(window as any).umami.track(event, {
			props: data,
		});
	};

	return {
		trackEvent,
	};
}
