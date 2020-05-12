import { GpxData } from 'shared/activity-parsers/gpx-parser';

export type Interval = {
	intensity: number;
	length: number;
};

export type IntervalWithColor = Interval & { color: string };

export type DiscrepencyCurvePoint = { t: number; delta: number };

export type ActivityToIntervalParameters = {
	minIntervalDuration: number;
	windowRadius: number;
	stepThreshold: number;
};

export type WorkoutCreatorState = Readonly<{
	activity?: GpxData;
	generationParams: ActivityToIntervalParameters;
	generatingFromActivity: boolean;
	ftp: number;
	newInterval: Interval;
	currentIntervals: readonly Interval[];
	history: readonly Interval[][];
	currentHistoryPosition: number;
	selectedIndex: number | null;
}>;
