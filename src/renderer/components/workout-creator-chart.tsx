import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as lodash from 'lodash';
import { findNiceTimeTickInterval } from '@/shared/utils/chart-utils';
import { formatSecondsAsHHMMSS } from '@/shared/utils/time-format-utils';

type Interval = {
	intensity: number;
	length: number;
	color: string;
};

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

	let startX: number;
	let xDiff: number;

	const drag = d3
		.drag<SVGRectElement, IntervalChartItem>()
		.on('start', (d, i, j) => {
			const bar = d3.select(j[i]);
			const mouseX = d3.mouse(j[i])[0];
			const barX = parseFloat(bar.attr('x'));

			// Store the x coordinate of bar when the dragging starts and offset to mouse
			startX = barX;
			xDiff = mouseX - barX;

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
			const newX = mouseX - xDiff;

			const draggingBarWidth = xScaleTimeSpan(d.length);
			const backlash = draggingBarWidth / 2;

			if (newX < xScale.range()[0] - backlash || xScale.range()[1] - backlash < newX) return;

			draggingBar.attr('x', newX);

			// Get the index of the nearest bar
			const nearestIdx = (() => {
				if (dragDataCurrentIndex === 0) return 1;

				if (newX < startX || dragDataCurrentIndex === data.length - 1)
					return dragDataCurrentIndex - 1;

				return dragDataCurrentIndex + 1;
			})();

			const nearestBar = d3
				.selectAll<SVGRectElement, IntervalChartItem>('.bar')
				.filter((d2: Interval) => d2 === data[nearestIdx]);

			const nearestX = parseFloat(nearestBar.attr('x'));

			// If the current bar is moved close enough to the nearest bar,
			// then update the order of the data array. For example, if we are dragging
			// the first bar and moving to right, the order will be [a, b, c] to [b, a, c]
			if (startX + draggingBarWidth < newX || newX < startX - draggingBarWidth) {
				const tmp = data[dragDataCurrentIndex];
				data[dragDataCurrentIndex] = data[nearestIdx];
				data[nearestIdx] = tmp;

				// Update start times
				for (let k = 0; k < data.length; ++k) {
					data[k].startTime = k === 0 ? 0 : data[k - 1].startTime + data[k - 1].length;
				}

				startX = nearestX;

				nearestBar
					.transition()
					.duration(100)
					.attr('x', xScale(nearestBar.datum().startTime) ?? 0);
			}
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

const WorkoutCreatorChart = () => {
	const svgRef = useRef<SVGSVGElement>(null);

	const [data, setData] = useState<Interval[]>([
		{ intensity: 0.3, length: 60, color: d3.schemeBlues[5][0] },
		{ intensity: 0.4, length: 60, color: d3.schemeBlues[5][0] },
		{ intensity: 0.5, length: 60, color: d3.schemeBlues[5][0] },
		{ intensity: 0.6, length: 60 * 5, color: d3.schemeBlues[5][1] },
		...Array(13)
			.fill([
				{ intensity: 1.3, length: 30, color: d3.schemeBlues[5][3] },
				{ intensity: 0.6, length: 15, color: d3.schemeBlues[5][2] }
			])
			.flat(),
		{ intensity: 0.6, length: 60 * 5, color: d3.schemeBlues[5][1] }
	]);

	const width = 600;
	const height = 400;

	useEffect(() => {
		if (svgRef.current) {
			buildChart(svgRef.current, width, height, data, setData);
		}
	}, [data]);

	return <svg ref={svgRef} width={width} height={height} />;
};

export default WorkoutCreatorChart;
