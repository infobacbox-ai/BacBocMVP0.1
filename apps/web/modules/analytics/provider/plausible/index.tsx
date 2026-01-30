"use client";

import Script from "next/script";

const plausibleUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_URL as string;

export function AnalyticsScript() {
	return (
		<Script
			// @ts-expect-error - React 19 stricter JSX checking, defer prop not in Next.js Script types yet
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
