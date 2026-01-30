"use client";

import { AnalyticsScript } from "@analytics";
import { ProgressProvider } from "@bprogress/next/app";
import { config } from "@repo/config";
import { ApiClientProvider } from "@shared/components/ApiClientProvider";
import { ConsentBanner } from "@shared/components/ConsentBanner";
import { Toaster } from "@ui/components/toast";
import { ThemeProvider } from "next-themes";
import type { ComponentType, PropsWithChildren, ReactNode } from "react";

const ThemeProviderShim = ThemeProvider as unknown as ComponentType<{
	attribute?: string;
	disableTransitionOnChange?: boolean;
	enableSystem?: boolean;
	defaultTheme?: string;
	themes?: string[];
	children?: ReactNode;
}>;

export function ClientProviders({ children }: PropsWithChildren) {
	return (
		<ApiClientProvider>
			<ProgressProvider
				height="4px"
				color="var(--color-primary)"
				options={{ showSpinner: false }}
				shallowRouting
				delay={250}
			>
				<ThemeProviderShim
					attribute="class"
					disableTransitionOnChange
					enableSystem
					defaultTheme={config.ui.defaultTheme}
					themes={config.ui.enabledThemes}
				>
					<ApiClientProvider>
						{children}

						<Toaster position="top-right" />
						<ConsentBanner />
						<AnalyticsScript />
					</ApiClientProvider>
				</ThemeProviderShim>
			</ProgressProvider>
		</ApiClientProvider>
	);
}
