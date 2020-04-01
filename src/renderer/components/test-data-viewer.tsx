import * as React from 'react';
import { useMemo } from 'react';
import * as activityCalculator from '@shared/activity-data/activity-calculator';
import XYPlot from '@ui/charts/xy-plot';
import { useActivitySelector } from '@state/reducers';

const defaultSecondTicks = [5, 30];

const defaultMinuteTicks = [2, 5, 10, 20, 30, 45];

const defaultHourTicks = [1, 2, 5];

const defaultTimeTicks = [
	...defaultSecondTicks,
	...defaultMinuteTicks.map(t => t * 60),
	...defaultHourTicks.map(t => t * 60 * 60)
];

const formatSecondsAsHHMMSS = (seconds: number): string => {
	const roundedSeconds = Math.round(seconds);
	if (roundedSeconds < 60) return String(seconds);

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	const remainingSecondsStr =
		remainingSeconds < 10 ? `0${remainingSeconds}` : String(remainingSeconds);
	return `${minutes}:${remainingSecondsStr}`;
};

const formatSecondsAsTimeWords = (seconds: number): string => {
	const roundedSeconds = Math.round(seconds);
	if (roundedSeconds < 60) return `${seconds} s`;

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	const remainingSecondsStr =
		remainingSeconds === 0 ? `` : ` ${remainingSeconds < 10 ? `0` : ``}${remainingSeconds} s`;

	return `${minutes} m${remainingSecondsStr}`;
};

const TestDataViewer = () => {
	const loadedFiles = useActivitySelector(s => s.files);

	const processedDataPerFile = useMemo(
		() => loadedFiles.map(l => activityCalculator.fromGPXData(l.gpx)),
		[loadedFiles]
	);

	const timeSeries = processedDataPerFile.map(d => {
		return { name: '', data: activityCalculator.getAsTimeSeries(d, 'heartrate') };
	});

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
				xAxisLabel="time"
				yAxisLabel="HR"
			/>
			<XYPlot
				className="test-data-chart"
				series={maxHRIntervalsSeries}
				xTickFormat={formatSecondsAsTimeWords}
				xTickValues={defaultTimeTicks}
				xAxisLabel="time"
				yAxisLabel="HR"
			/>
			<XYPlot
				className="test-data-chart"
				series={maxPowerIntervalsSeries}
				xTickFormat={formatSecondsAsTimeWords}
				xTickValues={defaultTimeTicks}
				xAxisLabel="time"
				yAxisLabel="Power"
			/>
		</div>
	);
};

export default TestDataViewer;
