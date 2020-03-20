import * as React from 'react';
import { useMemo, useState } from 'react';
import {
	FlexibleXYPlot,
	HorizontalGridLines,
	VerticalGridLines,
	XAxis,
	YAxis,
	LineMarkSeries,
	Highlight,
	Borders
} from 'react-vis';

type ReactVisArea = {
	left: number;
	right: number;
	top: number;
	bottom: number;
};

export type DataPoint = {
	x: number;
	// null will allow gaps in series lines
	y: number | null;
};

export type DataSeriesT<DataPointT extends DataPoint> = {
	name: string;
	data: DataPointT[];
	color?: string;
};

interface Props<DataPointT extends DataPoint> {
	className?: string;
	series: DataSeriesT<DataPointT>[];

	xAxisLabel?: string;
	yAxisLabel?: string;

	xTickFormat?(value: number, index?: number): string | React.ReactSVGElement;
	yTickFormat?(value: number, index?: number): string | React.ReactSVGElement;
}

const buildSeriesComponents = <DataPointT extends DataPoint>(series: DataSeriesT<DataPointT>[]) => {
	const seriesComponents = series
		.filter(s => s.data.length > 0)
		.map((s, i) => (
			<LineMarkSeries
				key={i}
				size={2}
				data={s.data}
				color={s.color}
				lineStyle={{ fill: 'none' }}
				getNull={(p: DataPoint) => p.y !== null}
			/>
		));

	if (seriesComponents.length > 0) {
		return seriesComponents;
	}

	// If we don't have any series, return a dummy one so the chart still displays
	return <LineMarkSeries size={0} data={[{ x: 0, y: 0 }]} />;
};

const gridStyle = { stroke: 'lightgrey' };
const axisStyle = { line: { stroke: 'black' } };
const backgroundFill = { fill: '#fff' };
// Define a style for the border around the inner chart area
// which blocks the chart series from being seen under the axes
const borderStyle = {
	bottom: backgroundFill,
	left: backgroundFill,
	right: backgroundFill,
	top: backgroundFill
};

const XYPlot = <DataPointT extends DataPoint>(props: Props<DataPointT>) => {
	const { series } = props;

	const [zoomArea, setZoomArea] = useState<ReactVisArea | null>(null);

	const xDomain = zoomArea && [zoomArea.left, zoomArea.right];
	const yDomain = zoomArea && [zoomArea.bottom, zoomArea.top];
	const seriesComponents = useMemo(() => buildSeriesComponents(series), [series]);

	return (
		<FlexibleXYPlot className={props.className} xDomain={xDomain} yDomain={yDomain}>
			<HorizontalGridLines style={gridStyle} />
			<VerticalGridLines style={gridStyle} />
			{seriesComponents}
			<Borders style={borderStyle} />
			<XAxis title={props.xAxisLabel} style={axisStyle} tickFormat={props.xTickFormat} />
			<YAxis title={props.yAxisLabel} style={axisStyle} tickFormat={props.yTickFormat} />
			<Highlight onBrushEnd={setZoomArea} />
		</FlexibleXYPlot>
	);
};

XYPlot.defaultProps = {
	xAxisLabel: '',
	yAxisLabel: ''
};

export default XYPlot;
