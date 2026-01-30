"use client";

import Script from "next/script";
import type { ComponentProps } from "react";

const pirschCode = process.env.NEXT_PUBLIC_PIRSCH_CODE as string;

export function AnalyticsScript() {
	return (
		<Script
			{...({
				src: "https://api.pirsch.io/pirsch-extended.js",
				id: "pirschextendedjs",
				"data-code": pirschCode,
			} as ComponentProps<typeof Script>)}
		/>
	);
}

export function useAnalytics() {
	const trackEvent = (event: string, data?: Record<string, unknown>) => {
		if (typeof window === "undefined" || !(window as any).pirsch) {
			return;
		}

		(window as any).pirsch(event, {
			meta: data,
		});
	};

	return {
		trackEvent,
	};
}
