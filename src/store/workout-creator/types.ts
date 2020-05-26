import { ActivityContainer } from 'library/activity-data/activity-container';
import { Interval } from 'library/activity-data/interval';
import { IntervalDetectionParameters } from 'library/activity-data/interval-detection';

export type WorkoutCreatorState = Readonly<{
	activity?: ActivityContainer;
	generationParams: IntervalDetectionParameters;
	generatingFromActivity: boolean;
	ftp: number;
	newInterval: Interval;
	currentIntervals: readonly Interval[];
	history: readonly Interval[][];
	currentHistoryPosition: number;
	selectedIndex: number | null;
}>;
