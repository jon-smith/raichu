import { ActivityContainer } from 'library/activity-data/activity-container';
import { Interval } from 'library/activity-data/interval';

export type DiscrepencyCurvePoint = { t: number; delta: number };

export type ActivityToIntervalParameters = {
	minIntervalDuration: number;
	inputSmoothingRadius: number;
	discrepencySmoothingRadius: number;
	windowRadius: number;
	stepThreshold: number;
};

export type WorkoutCreatorState = Readonly<{
	activity?: ActivityContainer;
	generationParams: ActivityToIntervalParameters;
	generatingFromActivity: boolean;
	ftp: number;
	newInterval: Interval;
	currentIntervals: readonly Interval[];
	history: readonly Interval[][];
	currentHistoryPosition: number;
	selectedIndex: number | null;
}>;
