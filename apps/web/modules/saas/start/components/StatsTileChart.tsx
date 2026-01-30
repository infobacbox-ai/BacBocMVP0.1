"use client";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@ui/components/chart";
import { cn } from "@ui/lib";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const ChartXAxis = XAxis as unknown as React.ComponentType<{
	dataKey: string;
	tickLine?: boolean;
	axisLine?: boolean;
	tickMargin?: number;
}>;
const ChartArea = Area as unknown as React.ComponentType<{
	dataKey: string;
	type?: "natural" | "linear" | "monotone" | "step";
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
}>;
const ChartTooltipCompat = ChartTooltip as unknown as React.ComponentType<{
	content?: React.ReactNode;
}>;

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
				<ChartXAxis
					dataKey="month"
					tickLine={false}
					axisLine={false}
					tickMargin={8}
				/>
				<ChartTooltipCompat
					content={
						<ChartTooltipContent formatter={tooltipFormatter} />
					}
				/>
				<ChartArea
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
