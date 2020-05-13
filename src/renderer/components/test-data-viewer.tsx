import * as React from 'react';
import { useMemo } from 'react';
import * as lodash from 'lodash';
import XYPlot, { DataSeriesT } from 'ui/charts/xy-plot';
import * as activityCalculator from 'shared/activity-data/activity-calculator';
import { ActivityContainer } from 'shared/activity-data/activity-container';
import { buildNiceTimeTicksToDisplay } from 'shared/utils/chart-utils';
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

function buildPaceCurve(d: ActivityContainer) {
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

function buildPowerCurve(d: ActivityContainer) {
	const timeIntervals = [1, 5, 10, 30, 60, 120, 240, 360, 600, 900];

	const bestSplits = activityCalculator.getBestSplitsVsTime(d, 'power', timeIntervals, 10);

	const bestSplitsDataPoints = bestSplits.map(r => ({
		x: r.distance,
		y: r.best?.average ?? null
	}));

	return { name: 'power-curve', data: bestSplitsDataPoints };
}

function buildHRCurve(d: ActivityContainer) {
	const timeIntervals = [1, 5, 10, 30, 60, 120, 240, 360, 600, 900];

	const bestSplits = activityCalculator.getBestSplitsVsTime(d, 'heartrate', timeIntervals, 10);

	const bestSplitsDataPoints = bestSplits.map(r => ({
		x: r.distance,
		y: r.best?.average ?? null
	}));

	return { name: 'hr-best-splits', data: bestSplitsDataPoints };
}

function buildTimeSeries(
	d: ActivityContainer,
	v: activityCalculator.Variable,
	name: string
): DataSeriesT {
	return {
		name,
		data: activityCalculator.getAsTimeSeries(d, v),
		seriesType: 'mark'
	};
}

function calcYDomain(series: readonly DataSeriesT[]) {
	let yRange = null as [number, number] | null;
	series.forEach(s =>
		s.data.forEach(d => {
			if (d.y !== null) {
				if (yRange == null) yRange = [d.y, d.y];
				else {
					if (d.y < yRange[0]) yRange[0] = d.y;
					if (d.y > yRange[1]) yRange[1] = d.y;
				}
			}
		})
	);

	if (yRange == null) return undefined;

	const difference = yRange[1] - yRange[0];

	const margin = difference === 0 ? yRange[0] * 0.1 : difference * 0.1;

	return [yRange[0] - margin, yRange[1] + margin] as const;
}

type BestSplitPlotProps = Pick<
	React.ComponentProps<typeof XYPlot>,
	'xAxisLabel' | 'yAxisLabel' | 'xTickValues' | 'xTickFormat' | 'series'
> & {
	defaultXDomain: readonly [number, number];
};

const BestSplitPlot = (props: BestSplitPlotProps) => {
	const { series, defaultXDomain, ...plotProps } = props;

	const yDomain = useMemo(() => calcYDomain(series), [series]);

	return (
		<XYPlot
			className="test-data-chart"
			series={series}
			xDomain={series.length === 0 ? defaultXDomain : undefined}
			yDomain={yDomain}
			xType="log"
			{...plotProps}
		/>
	);
};

const TestDataViewer = () => {
	const loadedActivities = useActivitySelector(s => s.activities);

	const {
		timeSeries,
		maxHRIntervalsSeries,
		maxPowerIntervalsSeries,
		maxPacePerDistanceIntervalsSeries
	} = useMemo(
		() => ({
			timeSeries: loadedActivities.map(d => buildTimeSeries(d, 'heartrate', 'hr-series')),
			maxHRIntervalsSeries: loadedActivities.map(buildHRCurve),
			maxPowerIntervalsSeries: loadedActivities.map(buildPowerCurve),
			maxPacePerDistanceIntervalsSeries: loadedActivities.map(buildPaceCurve)
		}),
		[loadedActivities]
	);

	const maxTimeSeconds =
		useMemo(() => lodash.max(timeSeries.flatMap(t => t.data.map(d => d.x))), [timeSeries]) ?? 0;

	const timeTicks = buildNiceTimeTicksToDisplay(maxTimeSeconds, 6);

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
			<BestSplitPlot
				series={maxHRIntervalsSeries}
				defaultXDomain={defaultTimeAxisRange}
				xAxisLabel="time"
				yAxisLabel="HR"
				xTickFormat={formatSecondsAsTimeWords}
				xTickValues={defaultTimeTicksForBestSplits}
			/>
			<BestSplitPlot
				series={maxPowerIntervalsSeries}
				defaultXDomain={defaultTimeAxisRange}
				xAxisLabel="time"
				yAxisLabel="Power"
				xTickFormat={formatSecondsAsTimeWords}
				xTickValues={defaultTimeTicksForBestSplits}
			/>
			<BestSplitPlot
				series={maxPacePerDistanceIntervalsSeries}
				defaultXDomain={defaultPaceCurveXDomain}
				xAxisLabel="distance"
				yAxisLabel="pace"
				xTickValues={distancesForPaceCurve}
				xTickFormat={String}
			/>
		</div>
	);
};

export default TestDataViewer;
