import * as React from 'react';
import { useMemo } from 'react';
import * as lodash from 'lodash';
import XYPlot from 'ui/charts/xy-plot';
import * as activityCalculator from 'shared/activity-data/activity-calculator';
import { findNiceTimeTickInterval } from 'shared/utils/chart-utils';
import { useActivitySelector } from 'state/reducers';
import { formatSecondsAsHHMMSS, formatSecondsAsTimeWords } from 'shared/utils/time-format-utils';

function frontBack<T>(a: T[]) {
	return [a[0], a[a.length - 1]] as const;
}

const defaultSecondTicks = [5, 30];

const defaultMinuteTicks = [1, 2, 5, 10, 20, 30, 45];

const defaultHourTicks = [1, 2, 5];

const defaultTimeTicksForBestSplits = [
	...defaultSecondTicks,
	...defaultMinuteTicks.map(t => t * 60),
	...defaultHourTicks.map(t => t * 60 * 60)
];

const defaultTimeAxisRange = frontBack(defaultTimeTicksForBestSplits);

const distancesForPaceCurve = [100, 200, 400, 800, 1000, 1600, 5000, 10000];

const defaultPaceCurveXDomain = frontBack(distancesForPaceCurve);

const timeTicksToDisplay = (maxSeconds: number, maxTicks: number) => {
	const interval = findNiceTimeTickInterval(maxSeconds, maxTicks);
	return lodash.range(0, maxSeconds, interval);
};

function buildPaceCurve(d: activityCalculator.ActivityData) {
	const bestSplits = activityCalculator.getMinTimesPerDistance(d, distancesForPaceCurve);

	const bestSplitsDataPoints = bestSplits
		.filter(r => r.best !== null)
		.map(r => ({
			x: r.distance,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			y: r.distance / r.best!.time
		}));

	return { name: 'pace-curve', data: bestSplitsDataPoints };
}

function buildPowerCurve(d: activityCalculator.ActivityData) {
	const timeIntervals = [1, 5, 10, 30, 60, 120, 240, 360, 600, 900];

	const bestSplits = activityCalculator.getBestSplitsVsTime(d, 'power', timeIntervals, 10);

	const bestSplitsDataPoints = bestSplits.map(r => ({
		x: r.distance,
		y: r.best?.average ?? null
	}));

	return { name: 'power-curve', data: bestSplitsDataPoints };
}

function buildHRCurve(d: activityCalculator.ActivityData) {
	const timeIntervals = [1, 5, 10, 30, 60, 120, 240, 360, 600, 900];

	const bestSplits = activityCalculator.getBestSplitsVsTime(d, 'heartrate', timeIntervals, 10);

	const bestSplitsDataPoints = bestSplits.map(r => ({
		x: r.distance,
		y: r.best?.average ?? null
	}));

	return { name: 'hr-best-splits', data: bestSplitsDataPoints };
}

function buildTimeSeries(
	d: activityCalculator.ActivityData,
	v: activityCalculator.Variable,
	name: string
) {
	return {
		name,
		data: activityCalculator.getAsTimeSeries(d, v),
		seriesType: 'mark' as const
	};
}

const TestDataViewer = () => {
	const loadedFiles = useActivitySelector(s => s.files);

	const processedDataPerFile = useMemo(
		() => loadedFiles.map(l => activityCalculator.fromGPXData(l.gpx)),
		[loadedFiles]
	);

	const {
		timeSeries,
		maxHRIntervalsSeries,
		maxPowerIntervalsSeries,
		maxPacePerDistanceIntervalsSeries
	} = useMemo(
		() => ({
			timeSeries: processedDataPerFile.map(d => buildTimeSeries(d, 'heartrate', 'hr-series')),
			maxHRIntervalsSeries: processedDataPerFile.map(buildHRCurve),
			maxPowerIntervalsSeries: processedDataPerFile.map(buildPowerCurve),
			maxPacePerDistanceIntervalsSeries: processedDataPerFile.map(buildPaceCurve)
		}),
		[processedDataPerFile]
	);

	const maxTimeSeconds =
		useMemo(() => lodash.max(timeSeries.flatMap(t => t.data.map(d => d.x))), [timeSeries]) ?? 0;

	const timeTicks = timeTicksToDisplay(maxTimeSeconds, 6);

	return (
		<div className="test-data-viewer">
			<XYPlot
				className="test-data-chart"
				series={timeSeries}
				xTickFormat={formatSecondsAsHHMMSS}
				xTickValues={timeTicks}
				xAxisLabel="time"
				yAxisLabel="HR"
			/>
			<XYPlot
				className="test-data-chart"
				series={maxHRIntervalsSeries}
				xDomain={maxHRIntervalsSeries.length === 0 ? defaultTimeAxisRange : undefined}
				xTickFormat={formatSecondsAsTimeWords}
				xTickValues={defaultTimeTicksForBestSplits}
				xAxisLabel="time"
				yAxisLabel="HR"
				xType="log"
			/>
			<XYPlot
				className="test-data-chart"
				series={maxPowerIntervalsSeries}
				xDomain={maxPowerIntervalsSeries.length === 0 ? defaultTimeAxisRange : undefined}
				xTickFormat={formatSecondsAsTimeWords}
				xTickValues={defaultTimeTicksForBestSplits}
				xAxisLabel="time"
				yAxisLabel="Power"
				xType="log"
			/>
			<XYPlot
				className="test-data-chart"
				series={maxPacePerDistanceIntervalsSeries}
				xDomain={
					maxPacePerDistanceIntervalsSeries.length === 0 ? defaultPaceCurveXDomain : undefined
				}
				xTickValues={distancesForPaceCurve}
				xTickFormat={String}
				xAxisLabel="distance"
				yAxisLabel="pace"
				xType="log"
			/>
		</div>
	);
};

export default TestDataViewer;
