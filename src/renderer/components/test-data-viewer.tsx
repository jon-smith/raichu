import * as React from 'react'
import XYPlot from '@ui/charts/xy-plot';

const data = [1,2,3,4].map(x => ({x, y: x}));

const TestDataViewer = () => {
	return (
		<div className="test-data-viewer">
			<XYPlot 
				className="test-data-chart" 
				series={[{name: "", data: data, color: 'red'}]}
			/>
		</div>
	)
}

export default TestDataViewer;