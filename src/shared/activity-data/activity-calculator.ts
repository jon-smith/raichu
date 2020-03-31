import * as lodash from 'lodash';
import {
	fillMissingIndices,
	bestAveragesForDistances,
	interpolateNullValues
} from '@shared/activity-data/best-split-calculator';
import { GpxData, Track, Point } from './gpxparsing';

type ExtendedPoint = Point & {
	secondsSinceStart: number;
};

interface ActivityData {
	track: Track;
	flatPoints: ExtendedPoint[];
	filledPoints: { index: number; data?: ExtendedPoint }[];
}

const buildExtendedPoints = (points: Point[]): ExtendedPoint[] => {
	const earliestTime = lodash.min(points.map(p => p.time)) ?? new Date();
	return points.map(p => ({
		...p,
		secondsSinceStart: (p.time.getTime() - earliestTime.getTime()) * 0.001
	}));
};

const getVar = (p: ExtendedPoint, v: Variable) => {
	switch (v) {
		case 'heartrate':
			return p.heartRate ?? null;
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

export type Variable = 'heartrate' | 'time';

export const getAsTimeSeries = <T>(data: ActivityData, y: Variable) =>
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
