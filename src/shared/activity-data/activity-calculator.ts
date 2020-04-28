import * as lodash from 'lodash';
import { getDistance } from 'geolib';
import {
	fillMissingIndices,
	bestAveragesForDistances as jsBestAveragesForDistances,
	interpolateNullValues
} from 'shared/activity-data/best-split-calculator';
import { cumulative } from 'shared/utils/array-utils';
import * as jolteon from 'jolteon';
import { GpxData, Track, Point } from './gpxparsing';

const useNative = true;
const bestAveragesForDistances = useNative
	? jolteon.best_averages_for_distances
	: jsBestAveragesForDistances;

type ExtendedPoint = Point & {
	secondsSinceStart: number;
	cumulativeDistance_m: number;
};

interface ActivityData {
	track: Track;
	flatPoints: ExtendedPoint[];
	filledPoints: { index: number; data?: ExtendedPoint }[];
}

function asGeolibCoord(p: Point) {
	return {
		latitude: p.lat,
		longitude: p.lon
	};
}

const buildExtendedPoints = (points: Point[]): ExtendedPoint[] => {
	const earliestTime = lodash.min(points.map(p => p.time)) ?? new Date();
	const distancesBetween = points.map((p, i) =>
		i === 0 ? 0 : getDistance(asGeolibCoord(p), asGeolibCoord(points[i - 1]))
	);
	const cumulativeDistances = cumulative(distancesBetween);
	return points.map((p, i) => ({
		...p,
		cumulativeDistance_m: cumulativeDistances[i],
		secondsSinceStart: (p.time.getTime() - earliestTime.getTime()) * 0.001
	}));
};

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

export const fromGPXData = (gpx: GpxData): ActivityData => {
	const flatPoints = buildExtendedPoints(gpx.track.segments.flatMap(s => s.points));
	const filledPoints = fillMissingIndices(
		flatPoints.map(d => ({ ...d, index: d.secondsSinceStart }))
	);
	return {
		track: gpx.track,
		flatPoints,
		filledPoints
	};
};

export type Variable = 'heartrate' | 'power' | 'time';

export const getAsTimeSeries = (data: ActivityData, y: Variable) =>
	data.flatPoints.map(p => ({ x: p.secondsSinceStart, y: getVar(p, y) }));

export const extractData = (data: ActivityData, v: Variable) =>
	data.flatPoints.map(p => getVar(p, v));

export const getBestSplitsVsTime = (
	data: ActivityData,
	averageVar: Variable,
	timeRanges: number[],
	maxGapForInterpolation: number
) => {
	const interpolatedData = interpolateNullValues(
		data.filledPoints.map(p => (p.data !== undefined ? getVar(p.data, averageVar) ?? null : null)),
		maxGapForInterpolation
	);

	return bestAveragesForDistances(interpolatedData, timeRanges);
};
