"use client";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@ui/components/chart";
import { cn } from "@ui/lib";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

interface StatsTileChartProps {
	data: Array<{ month: string; [key: string]: string | number }>;
	dataKey: string;
	chartConfig: ChartConfig;
	gradientId: string;
	tooltipFormatter: (value: number | string) => React.ReactNode;
	className?: string;
}

export function StatsTileChart({
	data,
	dataKey,
	chartConfig,
	gradientId,
	tooltipFormatter,
	className,
}: StatsTileChartProps) {
	return (
		<ChartContainer
			config={chartConfig}
			className={cn("h-32 w-full", className)}
		>
			<AreaChart
				accessibilityLayer
				data={data}
				margin={{ top: 0, right: 5, left: 5, bottom: 20 }}
			>
				<defs>
					<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
						<stop
							offset="0%"
							stopColor={`var(--color-${dataKey})`}
							stopOpacity={0.4}
						/>
						<stop
							offset="100%"
							stopColor={`var(--color-${dataKey})`}
							stopOpacity={0}
						/>
					</linearGradient>
				</defs>
			<CartesianGrid vertical={false} />
			{/* @ts-expect-error - React 19 incompatibility with recharts component types */}
			<XAxis
				dataKey="month"
				tickLine={false}
				axisLine={false}
				tickMargin={8}
			/>
			{/* @ts-expect-error - React 19 incompatibility with recharts component types */}
			<ChartTooltip
				content={
					<ChartTooltipContent formatter={tooltipFormatter} />
				}
			/>
			{/* @ts-expect-error - React 19 incompatibility with recharts component types */}
			<Area
				dataKey={dataKey}
				type="natural"
				fill={`url(#${gradientId})`}
				stroke={`var(--color-${dataKey})`}
					strokeWidth={2}
				/>
			</AreaChart>
		</ChartContainer>
	);
}
