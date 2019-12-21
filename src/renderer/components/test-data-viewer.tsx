import React, { useState, useMemo } from 'react';
import * as lodash from 'lodash';
import XYPlot from '@ui/charts/xy-plot';
import GpxFileDrop, { FileAndGpx } from './gpx-file-drop';
import ActivitySummaryTable from './activity-summary-table';
import {fillMissingIndices, bestAveragesForDistances} from '@shared/activity-data/best-split-calculator';

const formatSecondsAsHHmm = (seconds: number): string =>
{
	const roundedSeconds = Math.round(seconds);
	if (roundedSeconds < 60)
		return String(seconds);

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	const remainingSecondsStr = remainingSeconds < 10 ? '0' + remainingSeconds : String(remainingSeconds);
	return `${minutes}:${remainingSecondsStr}`;
};

const TestDataViewer = () => {

	const [loadedFiles, setLoadedFiles] = useState<FileAndGpx[]>([]);

	const tableRows = useMemo(() => loadedFiles.map(l => ({
		filename: l.file.name,
		name: l.gpx.track.name,
		date: l.gpx.metadata?.time
	})), [loadedFiles]);

	const hrVsTimeSecondsPerFile = loadedFiles.map(l => {

		const heartRateAndTime = lodash.flatten(lodash.flatten(
			l.gpx.track.segments.map(s => s.points.map(p => ({ hr: p.heartRate, t: p.time })))));

		const earliestTime = lodash.min(heartRateAndTime.map(hrt => hrt.t)) ?? new Date();

		return heartRateAndTime
			.map(hrt => ({
				t: (hrt.t.getTime() - earliestTime.getTime()) * 0.001, // Time in seconds
				hr: hrt.hr === null || hrt.hr === undefined ? null : hrt.hr
			}));
	});

	const timeSeries = hrVsTimeSecondsPerFile.map(d => {

		const dataPoints = d
			.map(hrt => ({
				x: hrt.t,
				y: hrt.hr
			}));

		return { name: "", data: dataPoints };
	});

	const maxHRIntervalsSeries = hrVsTimeSecondsPerFile.map(d => {

		const hrDataFilled = fillMissingIndices(d.map(hrt => ({...hrt, index: hrt.t})));
		const bestSplits = bestAveragesForDistances(hrDataFilled.map(hrt => hrt.data?.hr ?? null), [1, 5, 10, 30, 60, 120, 600]);
		const bestSplitsDataPoints = bestSplits.map(r => ({x: r.distance, y: r.best?.average ?? null}));

		console.log(bestSplits);

		return {name: "best-splits", data: bestSplitsDataPoints};
	});

	return (<div className="test-data-viewer">
		<GpxFileDrop
			loadedFiles={loadedFiles}
			setLoadedFiles={setLoadedFiles}
		/>
		<ActivitySummaryTable
			rows={tableRows}
		/>
		<XYPlot
			className="test-data-chart"
			series={timeSeries}
			xTickFormat={formatSecondsAsHHmm}
			xAxisLabel={'time'}
			yAxisLabel={'HR'}
		/>
		<XYPlot
			className="test-data-chart"
			series={maxHRIntervalsSeries}
			xTickFormat={formatSecondsAsHHmm}
			xAxisLabel={'time'}
			yAxisLabel={'HR'}
		/>
	</div>);
};

export default TestDataViewer;