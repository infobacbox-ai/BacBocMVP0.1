import { Skeleton } from "@ui/components/skeleton";

/**
 * Loading skeleton for the BackBox project page
 */
export default function ProjectPageLoading() {
	return (
		<div className="container mx-auto py-8">
			<div className="mb-8">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-5 w-32 mt-2" />
			</div>

			<div className="mt-8 rounded-lg border border-border bg-card p-8 space-y-6">
				<Skeleton className="h-6 w-64" />
				<Skeleton className="h-4 w-full max-w-md" />
				<div className="space-y-2 mt-4">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
					<Skeleton className="h-4 w-4/6" />
				</div>
			</div>
		</div>
	);
}
