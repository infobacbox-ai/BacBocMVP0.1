/**
 * BackBox validation constants (shared between UI and API)
 * Single source of truth for input validation limits
 */

export const BACKBOX_VALIDATION = {
	SOURCE_TEXT_MIN_LENGTH: 1,
	SOURCE_TEXT_MAX_LENGTH: 30000,
	TITLE_MAX_LENGTH: 120,
} as const;
