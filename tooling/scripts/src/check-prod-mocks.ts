/**
 * Prod mock ban check (Slices Plan v4.3.3)
 *
 * Scans the production build output for forbidden mock patterns.
 * Fails if any mock code is bundled in production.
 */

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const FORBIDDEN_PATTERNS = [
	/\bmsw\b/,
	/mockServiceWorker/,
	/apps\/web\/src\/mocks/,
	/__mocks__/,
];

const BUILD_OUTPUT_DIR = "apps/web/.next";

function scanDirectory(dir: string, patterns: RegExp[]): string[] {
	const violations: string[] = [];

	if (!existsSync(dir)) {
		return violations;
	}

	function scan(currentDir: string) {
		const entries = readdirSync(currentDir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(currentDir, entry.name);

			if (entry.isDirectory()) {
				// Skip node_modules inside .next
				if (entry.name !== "node_modules") {
					scan(fullPath);
				}
			} else if (entry.isFile() && /\.(js|mjs|cjs)$/.test(entry.name)) {
				try {
					const content = readFileSync(fullPath, "utf-8");
					for (const pattern of patterns) {
						if (pattern.test(content)) {
							violations.push(
								`${fullPath}: matches pattern ${pattern}`,
							);
						}
					}
				} catch {
					// Skip files that can't be read
				}
			}
		}
	}

	scan(dir);
	return violations;
}

async function main() {
	console.log("🔍 Prod mock ban check (Slices Plan v4.3.3)\n");

	// Step 1: Run production build
	console.log("Step 1: Running production build...");
	try {
		execSync("pnpm -w build", {
			stdio: "inherit",
			env: { ...process.env, NODE_ENV: "production" },
		});
	} catch {
		console.error("❌ Build failed");
		process.exit(1);
	}

	// Step 2: Scan build output for forbidden patterns
	console.log("\nStep 2: Scanning build output for mock patterns...");
	const violations = scanDirectory(BUILD_OUTPUT_DIR, FORBIDDEN_PATTERNS);

	if (violations.length > 0) {
		console.error("\n❌ FAIL: Found mock code in production build:\n");
		for (const v of violations) {
			console.error(`  - ${v}`);
		}
		console.error("\nMock code must not be bundled in production builds.");
		console.error(
			"Check that MSW and mocks are only imported in development.",
		);
		process.exit(1);
	}

	console.log("\n✅ No mock code found in production build");
	process.exit(0);
}

main();
