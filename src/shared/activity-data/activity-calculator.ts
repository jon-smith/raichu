import * as jolteon from 'jolteon';
import {
	bestAveragesForDistances as jsBestAveragesForDistances,
	interpolateNullValues
} from 'shared/activity-data/best-split-calculator';
import { sortNumeric } from 'shared/utils/array-utils';
import { ActivityContainer, ExtendedPoint } from './activity-container';

const useNative = true;
const bestAveragesForDistances = useNative
	? jolteon.best_averages_for_distances
	: jsBestAveragesForDistances;

const getVar = (p: ExtendedPoint, v: Variable) => {
	switch (v) {
		case 'heartrate':
			return p.heartRate ?? null;
		case 'power':
			return p.power ?? null;
		case 'time':
			return p.secondsSinceStart;
		default:
			return null;
	}
};

export type Variable = 'heartrate' | 'power' | 'time';

export function getAsTimeSeries(data: ActivityContainer, y: Variable, filledPoints = false) {
	if (filledPoints) {
		return data.filledPoints.map(p => ({ x: p.index, y: p.data ? getVar(p.data, y) : null }));
	}
	return data.flatPoints.map(p => ({ x: p.secondsSinceStart, y: getVar(p, y) }));
}

export function extractData(data: ActivityContainer, v: Variable, filledPoints = false) {
	if (filledPoints) {
		return data.filledPoints.map(p => (p.data ? getVar(p.data, v) : null));
	}
	return data.flatPoints.map(p => getVar(p, v));
}

export type TimeSeriesProcessingOptions = {
	interpolateNull: boolean;
	maxGapForInterpolation: number;
	resolution: number;
};

export function getProcessedTimeSeries(
	data: ActivityContainer,
	variable: Variable,
	options: TimeSeriesProcessingOptions
) {
	const rawTimeSeries = getAsTimeSeries(data, variable, true);
	const rawValues = rawTimeSeries.map(v => v.y);
	const interpolatedValues = options.interpolateNull
		? interpolateNullValues(rawValues, options.maxGapForInterpolation)
		: rawValues;

	const interpolatedTimeSeries = interpolatedValues.map((v, i) => ({
		x: rawTimeSeries[i].x,
		y: v
	}));
	if (options.resolution <= 1) {
		return interpolatedTimeSeries;
	}

	type ResultT = typeof interpolatedTimeSeries;

	const result: ResultT = [];

	for (let i = 0; i < interpolatedTimeSeries.length; i += options.resolution) {
		let sum = null as null | number;
		const count = Math.min(options.resolution, interpolatedTimeSeries.length - i);
		for (let j = 0; j < count; ++j) {
			const value = interpolatedTimeSeries[i + j].y;
			if (value != null) {
				sum = value + (sum ?? 0);
			}
		}
		const average = sum === null ? null : sum / count;
		result.push({ x: interpolatedTimeSeries[i].x, y: average });
	}

	return result;
}

export type BestSplitOption = 'heartrate' | 'power' | 'time' | 'speed';

function asRawVariable(o: BestSplitOption): Variable | null {
	switch (o) {
		case 'heartrate':
			return 'heartrate';
		case 'power':
			return 'power';
		case 'time':
			return 'time';
		default:
			return null;
	}
}

function getInterpolatedDataPointsForBestSplits(
	data: ActivityContainer,
	option: BestSplitOption,
	maxGapForInterpolation: number
) {
	const rawVariable = asRawVariable(option);

	if (rawVariable) {
		const dataPoints = data.filledPoints.map(p =>
			p.data !== undefined ? getVar(p.data, rawVariable) ?? null : null
		);

		return interpolateNullValues(dataPoints, maxGapForInterpolation);
	}
	if (option === 'speed') {
		// For speed, we first interpolate cumulative distance and then calc speed from that
		const distances = data.filledPoints.map(p => p.data?.cumulativeDistance ?? null);
		const interpolatedDistances = interpolateNullValues(distances, maxGapForInterpolation);

		// Set all speeds to zero
		const speeds = interpolatedDistances.map(_ => 0);

		let previousDistance = interpolatedDistances[0] ?? 0;
		for (let i = 1; i < interpolatedDistances.length; ++i) {
			const distance = interpolatedDistances[i];
			if (distance != null) {
				const delta = distance - previousDistance;
				if (delta > 0) {
					// Each index is a unit of time, so no need to divide by t
					speeds[i] = delta;
				}
				previousDistance = distance;
			}
		}

		return speeds;
	}

	return [];
}

export const getBestSplitsVsTime = (
	data: ActivityContainer,
	option: BestSplitOption,
	timeRanges: number[],
	maxGapForInterpolation: number
) => {
	const interpolatedData = getInterpolatedDataPointsForBestSplits(
		data,
		option,
		maxGapForInterpolation
	);

	return bestAveragesForDistances(interpolatedData, timeRanges);
};

export const getMinTimesPerDistance = (data: ActivityContainer, distances: number[]) => {
	const sortedDistances = sortNumeric(distances);
	const maxDistance = sortedDistances[sortedDistances.length - 1];
	const results = sortedDistances.map(d => ({
		distance: d,
		best: null as null | { time: number; startTime: number }
	}));

	for (let i = 0; i < data.flatPoints.length; ++i) {
		const segmentStart = data.flatPoints[i];
		const segmentStartDistance = segmentStart.cumulativeDistance;
		if (segmentStartDistance) {
			for (let j = i; j < data.flatPoints.length; ++j) {
				const { secondsSinceStart, cumulativeDistance } = data.flatPoints[j];
				if (cumulativeDistance) {
					const deltaTime = secondsSinceStart - segmentStart.secondsSinceStart;
					const deltaDistance = cumulativeDistance - segmentStartDistance;

					for (let r = 0; r < results.length; ++r) {
						if (deltaDistance >= results[r].distance) {
							const currentBest = results[r].best;
							if (currentBest == null || deltaTime < currentBest.time) {
								results[r].best = { startTime: segmentStart.secondsSinceStart, time: deltaTime };
							}
						}
					}

					// Once we have exceeded the max distance, no point searching any more
					if (deltaDistance > maxDistance) break;
				}
			}
		}
	}

	return results;
};
