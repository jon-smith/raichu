import * as d3 from 'd3';
import {
	getProcessedTimeSeries,
	TimeSeriesProcessingOptions,
} from 'shared/activity-data/activity-calculator';
import * as ArrayUtils from 'shared/utils/array-utils';
import { ActivityContainer } from 'shared/activity-data/activity-container';
import { DiscrepencyCurvePoint, ActivityToIntervalParameters, Interval } from './types';

export function calculateActivityPowerPerSecond(activity?: ActivityContainer) {
	if (!activity) return [];

	return activity.filledPoints.map((p) => p.data?.power ?? null);
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
			resolution: 1,
		}
	);
}

export function calculateActivitySmoothedPowerTimeSeries(
	processedPowerTimeSeries: { x: number; y: number | null }[],
	movingAverageRadius?: number
) {
	return ArrayUtils.movingAverageObj(
		processedPowerTimeSeries.map((t) => ({ x: t.x, y: t.y ?? 0 })),
		'y',
		movingAverageRadius
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
		discrepencyCurve.map((d) => Math.abs(d.delta)).map((d) => (d > stepThreshold ? d : 0.0))
	);
	const indicesOfPeaks = ArrayUtils.filterNullAndUndefined(
		peaks.map((p, i) => (i !== 0 && (i === peaks.length - 1 || p === 'peak') ? i : null))
	);

	return indicesOfPeaks.map((i) => discrepencyCurve[i].t);
}

export function performIntervalDetection(
	activity: ActivityContainer | undefined,
	ftp: number,
	params: ActivityToIntervalParameters
) {
	const timeSeries = calculateActivityProcessedPowerTimeSeries(activity);
	const smoothedTimeSeries = calculateActivitySmoothedPowerTimeSeries(
		timeSeries,
		params.inputSmoothingRadius
	);
	const intensityPerSecond = smoothedTimeSeries.map((v) => v.y / ftp);
	const discrepencyCurve = calculateMovingWindowDiscrepencyCurve(
		intensityPerSecond,
		params.windowRadius,
		params.discrepencySmoothingRadius
	);
	const detectedStepTimePoints = calculateDetectedSteps(discrepencyCurve, params.stepThreshold);

	const result: Interval[] = [];

	for (let i = 1; i < detectedStepTimePoints.length; ++i) {
		const startTime = detectedStepTimePoints[i - 1];
		const endTime = detectedStepTimePoints[i];
		const duration = endTime - startTime;
		const thisIntervalData = intensityPerSecond.slice(startTime, endTime);
		result.push({ length: duration, intensity: d3.mean(thisIntervalData) ?? 0 });
	}

	return {
		intervals: result,
		rawInput: timeSeries,
		smoothedInput: smoothedTimeSeries,
		discrepencyCurve,
		detectedStepTimePoints,
	};
}
