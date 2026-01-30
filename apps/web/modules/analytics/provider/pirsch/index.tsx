"use client";

import Script, { type ScriptProps } from "next/script";
import type { ComponentType } from "react";

const pirschCode = process.env.NEXT_PUBLIC_PIRSCH_CODE as string;
const ScriptCompat = Script as unknown as ComponentType<
	ScriptProps & { defer?: boolean }
>;

export function AnalyticsScript() {
	return (
		<ScriptCompat
			defer
			type="text/javascript"
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
