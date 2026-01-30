"use client";

import Script from "next/script";
import type { ComponentType } from "react";

const pirschCode = process.env.NEXT_PUBLIC_PIRSCH_CODE as string;
type ScriptCompatProps = {
	src: string;
	id?: string;
	defer?: boolean;
	[key: string]: unknown;
};
const ScriptCompat = Script as unknown as ComponentType<ScriptCompatProps>;

export function AnalyticsScript() {
	return (
		<ScriptCompat
			defer
			src="https://api.pirsch.io/pirsch-extended.js"
			id="pirschextendedjs"
			data-code={pirschCode}
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
