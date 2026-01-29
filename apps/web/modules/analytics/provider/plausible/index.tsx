"use client";

import Script from "next/script";

const plausibleUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_URL as string;

export function AnalyticsScript() {
	return (
		<>
			{/* @ts-expect-error - Next.js Script src prop not recognized with React 19 types */}
			<Script
				data-domain={plausibleUrl}
				src="https://plausible.io/js/script.js"
			/>
		</>
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
