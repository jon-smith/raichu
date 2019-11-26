import * as React from 'react'
import {FlexibleXYPlot, HorizontalGridLines, VerticalGridLines, XAxis, YAxis, LineMarkSeries} from 'react-vis'

interface Props
{
	className?: string;
}

const XYPlot = (props: Props) =>
{
	const data = [1,2,3,4].map(x => ({x, y: x}));

	return (
		<FlexibleXYPlot className={props.className}>
			<HorizontalGridLines />
			<VerticalGridLines />
			<XAxis title={"X"}/>
			<YAxis title={"Y"}/>
			<LineMarkSeries data={data}/>
		</FlexibleXYPlot>
	)
}

export default XYPlot;