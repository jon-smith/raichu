import React, { useState, useMemo } from 'react';
import * as lodash from 'lodash';
import XYPlot from '@ui/charts/xy-plot';
import GpxFileDrop, { FileAndGpx } from './gpx-file-drop';
import ActivitySummaryTable from './activity-summary-table';

const TestDataViewer = () => {

	const [loadedFiles, setLoadedFiles] = useState<FileAndGpx[]>([]);

	const tableRows = useMemo(() => loadedFiles.map(l => ({
		filename: l.file.name,
		name: l.gpx.track.name,
		date: l.gpx.metadata?.time
	})), [loadedFiles]);

	const series = loadedFiles.map(l => {

		const heartRateAndTime = lodash.flatten(lodash.flatten(
			l.gpx.track.segments.map(s => s.points.map(p => ({ hr: p.heartRate, t: p.time })))));

		const earliestTime = lodash.min(heartRateAndTime.map(hrt => hrt.t)) ?? new Date();

		const dataPoints = heartRateAndTime
			.map(hrt => ({
				x: (hrt.t.getTime() - earliestTime.getTime()),
				y: hrt.hr === null || hrt.hr === undefined ? null : hrt.hr
			}));

		return { name: "", data: dataPoints };
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
			series={series}
		/>
	</div>);
};

export default TestDataViewer;