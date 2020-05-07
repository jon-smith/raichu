import { GpxData } from 'shared/activity-data/gpxparsing';
import {
	fromGPXData,
	getProcessedTimeSeries,
	TimeSeriesProcessingOptions
} from 'shared/activity-data/activity-calculator';

export function calculateActivityPowerPerSecond(activity?: GpxData) {
	if (!activity) return [];

	const activityData = fromGPXData(activity);

	return activityData.filledPoints.map(p => p.data?.power ?? null);
}

export function calculateActivityProcessedPowerTimeSeries(
	activity?: GpxData,
	options?: TimeSeriesProcessingOptions
) {
	if (!activity) return [];

	const activityData = fromGPXData(activity);
	return getProcessedTimeSeries(
		activityData,
		'power',
		options ?? {
			maxGapForInterpolation: 3,
			interpolateNull: true,
			resolution: 10
		}
	);
}
