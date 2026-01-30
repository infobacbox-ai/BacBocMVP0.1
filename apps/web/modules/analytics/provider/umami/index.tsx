"use client";

import Script, { type ScriptProps } from "next/script";
import type { ComponentType } from "react";

const umamiTrackingId = process.env.NEXT_PUBLIC_UMAMI_TRACKING_ID as string;
const ScriptCompat = Script as unknown as ComponentType<
	ScriptProps & { async?: boolean }
>;

export function AnalyticsScript() {
	return (
		<ScriptCompat
			async
			type="text/javascript"
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
