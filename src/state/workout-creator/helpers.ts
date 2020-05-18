import * as d3 from 'd3';
import {
	getProcessedTimeSeries,
	TimeSeriesProcessingOptions
} from 'shared/activity-data/activity-calculator';
import * as ArrayUtils from 'shared/utils/array-utils';
import { ActivityContainer } from 'shared/activity-data/activity-container';
import { DiscrepencyCurvePoint } from './types';

export function calculateActivityPowerPerSecond(activity?: ActivityContainer) {
	if (!activity) return [];

	return activity.filledPoints.map(p => p.data?.power ?? null);
}

export function calculateActivityProcessedPowerTimeSeries(
	activity?: ActivityContainer,
	options?: TimeSeriesProcessingOptions
) {
	if (!activity) return [];

	return getProcessedTimeSeries(
		activity,
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
	windowRadius: number,
	smoothingRadius: number
) {
	const multiplier = 1.0 / windowRadius;
	const discrepencyCurve = Array<DiscrepencyCurvePoint>(0);

	for (let i = windowRadius; i < intensityPerSecond.length - windowRadius; ++i) {
		const before = intensityPerSecond.slice(i - windowRadius, i);
		const after = intensityPerSecond.slice(i, i + windowRadius);
		const difference = d3.sum(after) - d3.sum(before);
		discrepencyCurve.push({ t: i, delta: difference * multiplier });
	}

	return ArrayUtils.movingAverageObj(discrepencyCurve, 'delta', smoothingRadius);
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

	return indicesOfPeaks.map(i => discrepencyCurve[i].t);
}
