import { GpxData } from 'shared/activity-data/gpxparsing';
import {
	fromGPXData,
	getProcessedTimeSeries,
	TimeSeriesProcessingOptions
} from 'shared/activity-data/activity-calculator';
import * as ArrayUtils from 'shared/utils/array-utils';
import * as d3 from 'd3';
import { DiscrepencyCurvePoint } from './types';

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
			resolution: 1
		}
	);
}

export function calculateMovingWindowDiscrepencyCurve(
	intensityPerSecond: number[],
	windowRadius: number
) {
	const multiplier = 1.0 / windowRadius;
	const discrepencyCurve = Array<DiscrepencyCurvePoint>(0);

	for (let i = windowRadius; i < intensityPerSecond.length - windowRadius; ++i) {
		const before = intensityPerSecond.slice(i - windowRadius, i);
		const after = intensityPerSecond.slice(i, i + windowRadius);
		const difference = d3.sum(after) - d3.sum(before);
		discrepencyCurve.push({ t: i, delta: difference * multiplier });
	}

	return discrepencyCurve;
}

export function calculateDetectedSteps(
	discrepencyCurve: ReturnType<typeof calculateMovingWindowDiscrepencyCurve>,
	stepThreshold: number
) {
	const peaks = ArrayUtils.findPeaksAndTroughs(
		discrepencyCurve.map(d => Math.abs(d.delta)).map(d => (d > stepThreshold ? d : 0.0))
	);
	const indicesOfPeaks = ArrayUtils.filterNullAndUndefined(
		peaks.map((p, i) => (i !== 0 && (i === peaks.length - 1 || p === 'peak') ? i : null))
	);

	return indicesOfPeaks;
}
