export type Interval = {
	durationSeconds: number;
	intensityPercent: number;
};

export type IntervalWithColor = Interval & { color: string };
