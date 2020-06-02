import * as d3 from 'd3';
import * as ArrayUtils from 'library/utils/array-utils';
import { ActivityContainer } from './activity-container';
import { IntervalWithPower } from './interval';
import { TimeSeriesProcessingOptions, getProcessedTimeSeries } from './activity-calculator';

export type DiscrepencyCurvePoint = { t: number; delta: number };

export type IntervalDetectionParameters = {
	minIntervalDuration: number;
	inputSmoothingRadius: number;
	discrepencySmoothingRadius: number;
	windowRadius: number;
	stepThreshold: number;
};

function calculateActivityProcessedPowerTimeSeries(
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

function calculateActivitySmoothedPowerTimeSeries(
	processedPowerTimeSeries: { x: number; y: number | null }[],
	movingAverageRadius?: number
) {
	return ArrayUtils.movingAverageObj(
		processedPowerTimeSeries.map((t) => ({ x: t.x, y: t.y ?? 0 })),
		'y',
		movingAverageRadius
	);
}

function calculateMovingWindowDiscrepencyCurve(
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

function calculateDetectedSteps(
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
	params: IntervalDetectionParameters
) {
	const timeSeries = calculateActivityProcessedPowerTimeSeries(activity);
	const smoothedTimeSeries = calculateActivitySmoothedPowerTimeSeries(
		timeSeries,
		params.inputSmoothingRadius
	);
	const powerPerSecond = smoothedTimeSeries.map((v) => v.y);
	const discrepencyCurve = calculateMovingWindowDiscrepencyCurve(
		powerPerSecond,
		params.windowRadius,
		params.discrepencySmoothingRadius
	);
	const detectedStepTimePoints = calculateDetectedSteps(discrepencyCurve, params.stepThreshold);

	const result: IntervalWithPower[] = [];

	for (let i = 0; i < detectedStepTimePoints.length; ++i) {
		const startTime = i === 0 ? 0 : detectedStepTimePoints[i - 1];
		const endTime = detectedStepTimePoints[i];
		const duration = endTime - startTime;
		const thisIntervalData = powerPerSecond.slice(startTime, endTime);
		result.push({
			durationSeconds: duration,
			power: d3.mean(thisIntervalData) ?? 0,
		});
	}

	return {
		intervals: result,
		rawInput: timeSeries,
		smoothedInput: smoothedTimeSeries,
		discrepencyCurve,
		detectedStepTimePoints,
	};
}
