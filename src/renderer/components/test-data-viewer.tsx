import * as React from 'react'
import { useState } from 'react'
import XYPlot from '@ui/charts/xy-plot';
import GpxFileDrop, { FileAndGpx } from './gpx-file-drop';

const data = [1, 2, 3, 4].map(x => ({ x, y: x }));

const TestDataViewer = () => {

	const [loadedFiles, setLoadedFiles] = useState<FileAndGpx[]>([]);

	const info = loadedFiles.map((f, i) => (
		<div key={i}>
			<h2>{f.file.name}</h2>
			<p>{'Name: ' + f.gpx.track.name}</p>
			<p>{'Metadata: ' + JSON.stringify(f.gpx.metadata)}</p>
		</div>
	));

	return (
		<div className="test-data-viewer">
			<XYPlot
				className="test-data-chart"
				series={[{ name: "", data: data, color: 'red' }]}
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