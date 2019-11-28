import * as React from 'react'
import { useMemo, useState, useCallback } from 'react'
import { FlexibleXYPlot, HorizontalGridLines, VerticalGridLines, XAxis, YAxis, LineMarkSeries, Highlight, Borders } from 'react-vis'

type ReactVisArea =
	{
		left: number;
		right: number;
		top: number;
		bottom: number;
	}

// Helper function to be called in response to the OnDrag event
const updateZoomAreaOnDrag = (currentArea: ReactVisArea | null, newArea: ReactVisArea) =>
	({
		bottom: currentArea?.bottom ?? 0 + (newArea.top - newArea.bottom),
		left: currentArea?.left ?? 0 - (newArea.right - newArea.left),
		right: currentArea?.right ?? 0 - (newArea.right - newArea.left),
		top: currentArea?.top ?? 0 + (newArea.top - newArea.bottom)
	});

export type DataPoint = {
	x: number;
	y: number;
};

export type DataSeriesT<DataPointT extends DataPoint> = {
	name: string;
	data: DataPointT[];
}

interface Props<DataPointT extends DataPoint> {
	className?: string;
	series: DataSeriesT<DataPointT>[];
}

const buildSeriesComponents =
	<DataPointT extends DataPoint>(series: DataSeriesT<DataPointT>[]) => {
		return series.map((s, i) => <LineMarkSeries key={i} data={s.data} />)
	}

const gridStyle = { stroke: 'lightgrey' };
const axisStyle = { line: { stroke: 'black' } };
const backgroundFill = { fill: '#fff' };
// Define a style for the border around the inner chart area
// which blocks the chart series from being seen under the axes
const borderStyle = {
	bottom: backgroundFill, left: backgroundFill, right: backgroundFill, top: backgroundFill
};

const XYPlot = <DataPointT extends DataPoint>(props: Props<DataPointT>) => {
	const { series } = props;

	const [zoomArea, setZoomArea] = useState<ReactVisArea | null>(null);
	const updateZoomArea = useCallback((area: ReactVisArea) => {
		setZoomArea(updateZoomAreaOnDrag(zoomArea, area));
	}, [zoomArea]);

	const xDomain = zoomArea && [zoomArea.left, zoomArea.right];
	const yDomain = zoomArea && [zoomArea.bottom, zoomArea.top];
	const seriesComponents = useMemo(() => buildSeriesComponents(series), [series]);

	return (
		<FlexibleXYPlot
			className={props.className}
			xDomain={xDomain}
			yDomain={yDomain}
		>
			<HorizontalGridLines style={gridStyle} />
			<VerticalGridLines style={gridStyle} />
			{seriesComponents}
			<Borders style={borderStyle} />
			<XAxis title={"X"} style={axisStyle} />
			<YAxis title={"Y"} style={axisStyle} />
			<Highlight
				onBrushEnd={(area: ReactVisArea) => setZoomArea(area)}
				onDrag={(area: ReactVisArea) => updateZoomArea(area)}
			/>
		</FlexibleXYPlot>
	)
}

export default XYPlot;