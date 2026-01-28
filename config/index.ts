import type { Config } from "./types";

export const config = {
	// Branding
	appName: "BackBox",

	// Internationalization (FR only for MVP0, but i18n stays enabled)
	i18n: {
		enabled: true,
		locales: {
			fr: {
				currency: "EUR",
				label: "Français",
			},
		},
		defaultLocale: "fr",
		defaultCurrency: "EUR",
		localeCookieName: "NEXT_LOCALE",
	},

	// Organizations (OFF for MVP0: single student / no teams)
	organizations: {
		enable: false,
		enableBilling: false,
		hideOrganization: false,
		enableUsersToCreateOrganizations: false,
		requireOrganization: false,
		forbiddenOrganizationSlugs: [
			"new-organization",
			"admin",
			"settings",
			"ai-demo",
			"organization-invitation",
		],
	},

	// Users (no onboarding form; no billing for MVP0)
	users: {
		enableBilling: false,
		enableOnboarding: false,
	},

	// Authentication (MVP0: password-only, signup enabled, redirect to /backbox)
	auth: {
		enableSignup: true,
		enableMagicLink: false,
		enableSocialLogin: false,
		enablePasskeys: false,
		enablePasswordLogin: true,
		enableTwoFactor: false,

		redirectAfterSignIn: "/backbox",
		redirectAfterLogout: "/access",

		sessionCookieMaxAge: 60 * 60 * 24 * 30,
	},

	// Mails (Resend configured: make sure this "from" is verified/allowed in Resend)
	mails: {
		from: process.env.MAIL_FROM ?? "noreply@supastarter.dev",
	},

	// Storage (no uploads needed for MVP0; keep config for later)
	storage: {
		bucketNames: {
			avatars: process.env.NEXT_PUBLIC_AVATARS_BUCKET_NAME ?? "avatars",
		},
	},

	// Frontend
	ui: {
		enabledThemes: ["light", "dark"],
		defaultTheme: "light",
		saas: {
			enabled: true,
			useSidebarLayout: true,
		},
		// Marketing OFF for MVP0
		marketing: {
			enabled: false,
		},
	},

	// Contact form OFF for MVP0
	contactForm: {
		enabled: false,
		to: "hello@your-domain.com",
		subject: "Contact form message",
	},

	// Payments (billing OFF for MVP0; keep plan structure so UI doesn’t break)
	payments: {
		plans: {
			free: {
				isFree: true,
			},
			pro: {
				recommended: true,
				prices: [
					{
						type: "recurring",
						productId: "TODO_LEMONSQUEEZY_PRO_MONTHLY",
						interval: "month",
						amount: 29,
						currency: "EUR",
						seatBased: false,
						trialPeriodDays: 0,
					},
					{
						type: "recurring",
						productId: "TODO_LEMONSQUEEZY_PRO_YEARLY",
						interval: "year",
						amount: 290,
						currency: "EUR",
						seatBased: false,
						trialPeriodDays: 0,
					},
				],
			},
			lifetime: {
				prices: [
					{
						type: "one-time",
						productId: "TODO_LEMONSQUEEZY_LIFETIME",
						amount: 799,
						currency: "EUR",
					},
				],
			},
			enterprise: {
				isEnterprise: true,
			},
		},
	},
} as const satisfies Config;

export type { Config };
