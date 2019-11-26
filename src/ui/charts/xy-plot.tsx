import * as React from 'react'
import {useMemo} from 'react'
import {FlexibleXYPlot, HorizontalGridLines, VerticalGridLines, XAxis, YAxis, LineMarkSeries} from 'react-vis'

export type DataPoint = {
	x: number; 
	y: number
};

export type DataSeriesT<DataPointT extends DataPoint> = {
	name: string;
	data: DataPointT[];
}

interface Props<DataPointT extends DataPoint>
{
	className?: string;
	series: DataSeriesT<DataPointT>[];
}

const buildSeriesComponents = 
<DataPointT extends DataPoint>(series: DataSeriesT<DataPointT>[]) => {
	return series.map((s, i) => <LineMarkSeries key={i} data={s.data}/>)
}

const XYPlot = <DataPointT extends DataPoint>(props: Props<DataPointT>) =>
{
	const {series} = props;
	const seriesComponents = useMemo(() => buildSeriesComponents(series), [series]);

	return (
		<FlexibleXYPlot className={props.className}>
			<HorizontalGridLines />
			<VerticalGridLines />
			<XAxis title={"X"}/>
			<YAxis title={"Y"}/>
			{seriesComponents}
		</FlexibleXYPlot>
	)
}

export default XYPlot;