import * as React from 'react';
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import * as lodash from 'lodash';
import { findNiceTimeTickInterval } from '@/shared/utils/chart-utils';
import { formatSecondsAsHHMMSS } from '@/shared/utils/time-format-utils';
import { Interval } from '@/state/actions/workoutCreatorActions';

type IntervalChartItem = Interval & { startTime: number };

const calculateStartTimes = (intervals: Interval[]): IntervalChartItem[] => {
	const copy = intervals.map(i => ({ ...i, startTime: 0 }));
	for (let i = 0; i < intervals.length; ++i) {
		copy[i].startTime = i === 0 ? 0 : copy[i - 1].startTime + copy[i - 1].length;
	}
	return copy;
};

const timeTicksToDisplay = (maxSeconds: number, maxTicks: number) => {
	const interval = findNiceTimeTickInterval(maxSeconds, maxTicks);
	return lodash.range(0, maxSeconds, interval);
};

const moveItemInArray = <T extends {}>(input: T[], from: number, to: number) => {
	const inputCopy = input.slice();
	inputCopy.splice(to, 0, inputCopy.splice(from, 1)[0]);
	return inputCopy;
};

const buildChart = (
	nodeRef: SVGSVGElement,
	width: number,
	height: number,
	initialData: Interval[],
	updateData: (d: Interval[]) => void
) => {
	const svg = d3.select(nodeRef).html('');

	const padding = { top: 20, left: 40, right: 40, bottom: 20 };

	const xScale = d3.scaleLinear();
	const yScale = d3.scaleLinear();

	const xScaleTimeSpan = (t: number) => xScale(t) - xScale(0);

	const data = calculateStartTimes(initialData);

	let dragStartMouseX: number;
	let dragMouseOffsetX: number;

	const drag = d3
		.drag<SVGRectElement, IntervalChartItem>()
		.on('start', (d, i, j) => {
			const bar = d3.select(j[i]);
			const mouseX = d3.mouse(j[i])[0];
			const barX = parseFloat(bar.attr('x'));

			// Store the original mouse position and offset
			dragStartMouseX = mouseX;
			dragMouseOffsetX = mouseX - barX;

			// Bring the bar to the front
			if (bar.node()) {
				nodeRef.appendChild(bar.node()!);
			}
		})
		.on('drag', (d, i, j) => {
			const draggingBar = d3.select(j[i]);
			// We rearrange the data as we drag, so the original i value isn't the index in the data array
			const dragDataCurrentIndex = data.indexOf(d);

			const mouseX = d3.mouse(j[i])[0];

			const newX = mouseX - dragMouseOffsetX;

			const draggingBarWidth = xScaleTimeSpan(d.length);
			const backlash = draggingBarWidth / 2;

			// Don't let the bar go to far outside the axis range
			if (newX < xScale.range()[0] - backlash || xScale.range()[1] - backlash < newX) return;

			draggingBar.attr('x', newX);

			// Find the index that we want to move the bar to
			const newIndex = data.findIndex(d2 => xScale(d2.startTime) >= newX);
			const newIndexToUse = newIndex === -1 ? data.length - 1 : newIndex;

			if (dragDataCurrentIndex === newIndexToUse) return;

			const newDataOrder = moveItemInArray(data, dragDataCurrentIndex, newIndexToUse);

			for (let k = 0; k < data.length; ++k) {
				data[k] = newDataOrder[k];
				data[k].startTime = k === 0 ? 0 : data[k - 1].startTime + data[k - 1].length;
			}

			d3.selectAll<SVGRectElement, IntervalChartItem>('.bar')
				.filter(d2 => d2 !== d)
				.transition()
				.duration(100)
				.attr('x', d2 => xScale(d2.startTime) ?? 0);
		})
		.on('end', (d, i, j) => {
			const bar = d3.select(j[i]);
			bar
				.transition()
				.duration(300)
				.attr('x', xScale(d.startTime) ?? 0)
				.on('end', () => updateData(data));
		});

	const endTimeSeconds = d3.max(data, d => d.startTime + d.length) ?? 0;

	const xAxis = d3
		.axisBottom(xScale)
		.tickValues(timeTicksToDisplay(endTimeSeconds, 6))
		.tickFormat(formatSecondsAsHHMMSS as any);

	const yAxis = d3.axisLeft(yScale).tickFormat(d3.format('.0%'));

	xScale.domain([0, endTimeSeconds]).range([padding.left, width - padding.right]);

	yScale
		.domain([0, d3.max(data, d => d.intensity) ?? 0])
		.range([height - padding.bottom, padding.top]);

	svg
		.selectAll('rect')
		.data(data)
		.enter()
		.append('rect')
		.attr('width', d => xScaleTimeSpan(d.length))
		.attr('height', d => height - padding.bottom - yScale(d.intensity))
		.attr('x', d => xScale(d.startTime))
		.attr('y', d => yScale(d.intensity))
		.attr('fill', d => d.color)
		.attr('class', 'bar')
		.call(drag);

	svg
		.append('g')
		.attr('transform', `translate(${0},${height - padding.bottom})`)
		.attr('class', 'x axis')
		.call(xAxis);

	svg
		.append('g')
		.attr('transform', `translate(${padding.left},${0})`)
		.attr('class', 'y axis')
		.call(yAxis);
};

interface Props {
	intervals: Interval[];
	setIntervals: (i: Interval[]) => void;
}

const WorkoutCreatorChart = (props: Props) => {
	const svgRef = useRef<SVGSVGElement>(null);

	const { intervals, setIntervals } = props;

	const width = 600;
	const height = 400;

	useEffect(() => {
		if (svgRef.current) {
			buildChart(svgRef.current, width, height, intervals, setIntervals);
		}
	}, [intervals, setIntervals]);

	return <svg ref={svgRef} width={width} height={height} />;
};

export default WorkoutCreatorChart;
