import * as React from 'react'
import { useMemo, useState, useCallback } from 'react'
import { FlexibleXYPlot, HorizontalGridLines, VerticalGridLines, XAxis, YAxis, LineMarkSeries, Highlight } from 'react-vis'

type ReactVisArea =
	{
		left: number;
		right: number;
		top: number;
		bottom: number;
	}

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

const XYPlot = <DataPointT extends DataPoint>(props: Props<DataPointT>) => {
	const { series } = props;

	const [zoomArea, setZoomArea] = useState<ReactVisArea | null>(null);
	const updateZoomArea = useCallback((area: ReactVisArea) => {
		setZoomArea({
			bottom: zoomArea?.bottom ?? 0 + (area.top - area.bottom),
			left: zoomArea?.left ?? 0 - (area.right - area.left),
			right: zoomArea?.right ?? 0 - (area.right - area.left),
			top: zoomArea?.top ?? 0 + (area.top - area.bottom)
		});
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