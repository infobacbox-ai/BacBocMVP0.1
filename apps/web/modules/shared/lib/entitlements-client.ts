import type { GetEntitlementsOutput } from "@repo/shared";
import { orpcClient } from "./orpc-client";

/**
 * Single surface for fetching user entitlements
 * Wraps orpcClient.me.getEntitlements for consistent access across the app
 *
 * Usage in Server Components:
 *   const entitlements = await getEntitlements();
 *
 * Usage in Client Components:
 *   Use TanStack Query with orpc.me.getEntitlements.queryOptions()
 */
export async function getEntitlements(): Promise<GetEntitlementsOutput> {
	return await orpcClient.me.getEntitlements();
}
