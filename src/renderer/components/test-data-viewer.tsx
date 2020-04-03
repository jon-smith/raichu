import * as React from 'react';
import { useMemo } from 'react';
import * as lodash from 'lodash';
import XYPlot from '@ui/charts/xy-plot';
import * as activityCalculator from '@shared/activity-data/activity-calculator';
import { findNiceTimeTickInterval } from '@shared/utils/chart-utils';
import { useActivitySelector } from '@state/reducers';
import { formatSecondsAsHHMMSS, formatSecondsAsTimeWords } from '@/shared/utils/time-format-utils';

const defaultSecondTicks = [5, 30];

const defaultMinuteTicks = [1, 2, 5, 10, 20, 30, 45];

const defaultHourTicks = [1, 2, 5];

const defaultTimeTicksForBestSplits = [
	...defaultSecondTicks,
	...defaultMinuteTicks.map(t => t * 60),
	...defaultHourTicks.map(t => t * 60 * 60)
];

const timeTicksToDisplay = (maxSeconds: number, maxTicks: number) => {
	const interval = findNiceTimeTickInterval(maxSeconds, maxTicks);
	return lodash.range(0, maxSeconds, interval);
};

const TestDataViewer = () => {
	const loadedFiles = useActivitySelector(s => s.files);

	const processedDataPerFile = useMemo(
		() => loadedFiles.map(l => activityCalculator.fromGPXData(l.gpx)),
		[loadedFiles]
	);

	const timeSeries = useMemo(
		() =>
			processedDataPerFile.map(d => {
				return { name: '', data: activityCalculator.getAsTimeSeries(d, 'heartrate') };
			}),
		[processedDataPerFile]
	);

	const maxTimeSeconds =
		useMemo(() => lodash.max(timeSeries.flatMap(t => t.data.map(d => d.x))), [timeSeries]) ?? 0;

	const timeTicks = timeTicksToDisplay(maxTimeSeconds, 6);

	const maxHRIntervalsSeries = processedDataPerFile.map(d => {
		const timeIntervals = [1, 5, 10, 30, 60, 120, 240, 360, 600, 900];

		const bestSplits = activityCalculator.getBestSplitsVsTime(d, 'heartrate', timeIntervals, 10);

		const bestSplitsDataPoints = bestSplits.map(r => ({
			x: r.distance,
			y: r.best?.average ?? null
		}));

		return { name: 'best-splits', data: bestSplitsDataPoints };
	});

	const maxPowerIntervalsSeries = processedDataPerFile.map(d => {
		const timeIntervals = [1, 5, 10, 30, 60, 120, 240, 360, 600, 900];

		const bestSplits = activityCalculator.getBestSplitsVsTime(d, 'power', timeIntervals, 10);

		const bestSplitsDataPoints = bestSplits.map(r => ({
			x: r.distance,
			y: r.best?.average ?? null
		}));

		return { name: 'best-splits', data: bestSplitsDataPoints };
	});

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
				xTickFormat={formatSecondsAsTimeWords}
				xTickValues={defaultTimeTicksForBestSplits}
				xAxisLabel="time"
				yAxisLabel="HR"
			/>
			<XYPlot
				className="test-data-chart"
				series={maxPowerIntervalsSeries}
				xTickFormat={formatSecondsAsTimeWords}
				xTickValues={defaultTimeTicksForBestSplits}
				xAxisLabel="time"
				yAxisLabel="Power"
			/>
		</div>
	);
};

export default TestDataViewer;
