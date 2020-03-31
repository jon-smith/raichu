import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import * as activityCalculator from '@shared/activity-data/activity-calculator';
import XYPlot from '@ui/charts/xy-plot';
import { addGpxFiles } from '@state/actions/activityActions';
import { useActivitySelector } from '@state/reducers';
import GpxFileDrop, { FileAndGpx } from './gpx-file-drop';
import ActivitySummaryTable from './activity-summary-table';

const formatSecondsAsHHmm = (seconds: number): string => {
	const roundedSeconds = Math.round(seconds);
	if (roundedSeconds < 60) return String(seconds);

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	const remainingSecondsStr =
		remainingSeconds < 10 ? `0${remainingSeconds}` : String(remainingSeconds);
	return `${minutes}:${remainingSecondsStr}`;
};

const TestDataViewer = () => {
	const loadedFiles = useActivitySelector(s => s.files);

	const dispatch = useDispatch();
	const addFiles = useCallback((f: FileAndGpx[]) => dispatch(addGpxFiles(f)), []);

	const tableRows = useMemo(
		() =>
			loadedFiles.map(l => ({
				filename: l.file.name,
				name: l.gpx.track.name,
				date: l.gpx.metadata?.time
			})),
		[loadedFiles]
	);

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

	return (
		<div className="test-data-viewer">
			<GpxFileDrop loadedFiles={loadedFiles} onAddFiles={addFiles} />
			<ActivitySummaryTable rows={tableRows} />
			<XYPlot
				className="test-data-chart"
				series={timeSeries}
				xTickFormat={formatSecondsAsHHmm}
				xAxisLabel="time"
				yAxisLabel="HR"
			/>
			<XYPlot
				className="test-data-chart"
				series={maxHRIntervalsSeries}
				xTickFormat={formatSecondsAsHHmm}
				xAxisLabel="time"
				yAxisLabel="HR"
			/>
		</div>
	);
};

export default TestDataViewer;
