import * as React from 'react';
import { useState } from 'react';
import * as lodash from 'lodash';
import XYPlot from '@ui/charts/xy-plot';
import GpxFileDrop, { FileAndGpx } from './gpx-file-drop';

const TestDataViewer = () => {

	const [loadedFiles, setLoadedFiles] = useState<FileAndGpx[]>([]);

	const info = loadedFiles.map((f, i) => (
		<div key={i}>
			<h2>{f.file.name}</h2>
			<p>{'Name: ' + f.gpx.track.name}</p>
			<p>{'Metadata: ' + JSON.stringify(f.gpx.metadata)}</p>
		</div>
	));

	const series = loadedFiles.map(l => {

		const heartRateAndTime = lodash.flatten(lodash.flatten(
			l.gpx.track.segments.map(s => s.points.map(p => ({hr: p.heartRate, t: p.time})))));

		const earliestTime = lodash.min(heartRateAndTime.map(hrt => hrt.t)) ?? new Date();

		const dataPoints = heartRateAndTime
			.map(hrt => ({
				x: (hrt.t.getTime() - earliestTime.getTime()),
				y: hrt.hr === null || hrt.hr === undefined ? null : hrt.hr}));

		return {name: "", data: dataPoints}
	});

	return (
		<div className="test-data-viewer">
			<XYPlot
				className="test-data-chart"
				series={series}
			/>
			<GpxFileDrop
				loadedFiles={loadedFiles}
				setLoadedFiles={setLoadedFiles}
			/>
			<div className="test-data-info">
				{info}
			</div>
		</div>
	)
}

export default TestDataViewer;