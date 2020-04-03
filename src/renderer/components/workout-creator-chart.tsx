import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

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

const buildChart = (
	nodeRef: SVGSVGElement,
	width: number,
	height: number,
	initialData: Interval[],
	updateData: (d: Interval[]) => void
) => {
	const svg = d3.select(nodeRef).html('');

	const padding = { top: 20, left: 40, right: 20, bottom: 20 };

	const xScale = d3.scaleLinear();
	const yScale = d3.scaleLinear();

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
			const curBar = d3.select(j[i]);
			const curIdx = data.indexOf(d);

			const mouseX = d3.mouse(j[i])[0];
			const newX = mouseX - xDiff;

			const xRange = xScale(d.length) / 2; // (xScale.step() * 2) / 3;
			const backlash = xScale(d.length) / 2;

			if (newX < xScale.range()[0] - backlash || xScale.range()[1] - backlash < newX) return;

			curBar.attr('x', newX);

			// Get the index of the nearest bar
			const nearestIdx = (() => {
				if (curIdx === 0) return 1;

				if (newX < startX || curIdx === data.length - 1) return curIdx - 1;

				return curIdx + 1;
			})();

			const nearestBar = d3
				.selectAll<SVGRectElement, IntervalChartItem>('.bar')
				.filter((d2: Interval) => d2 === data[nearestIdx]);

			const nearestX = parseFloat(nearestBar.attr('x'));

			// If the current bar is moved close enough to the nearest bar,
			// then update the order of the data array. For example, if we are dragging
			// the first bar and moving to right, the order will be [a, b, c] to [b, a, c]
			if (startX + xRange < newX || newX < startX - xRange) {
				const tmp = data[curIdx];
				data[curIdx] = data[nearestIdx];
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

	const xAxis = d3.axisBottom(xScale);
	const yAxis = d3.axisLeft(yScale).tickFormat(d3.format('.0%'));

	xScale
		.domain([0, d3.max(data, d => d.startTime + d.length) ?? 0])
		.range([padding.left, width - padding.right]);

	yScale
		.domain([0, d3.max(data, d => d.intensity) ?? 0])
		.range([height - padding.bottom, padding.top]);

	svg
		.selectAll('rect')
		.data(data)
		.enter()
		.append('rect')
		.attr('width', d => xScale(d.length) - padding.left)
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
		{ intensity: 0.5, length: 60, color: d3.schemeBlues[3][0] },
		{ intensity: 0.3, length: 60, color: d3.schemeBlues[3][1] },
		{ intensity: 0.2, length: 60, color: d3.schemeBlues[3][2] },
		{ intensity: 0.2, length: 60, color: d3.schemeBlues[3][3] }
	]);

	const width = 400;
	const height = 400;

	useEffect(() => {
		if (svgRef.current) {
			buildChart(svgRef.current, width, height, data, setData);
		}
	}, [data]);

	return <svg ref={svgRef} width={width} height={height} />;
};

export default WorkoutCreatorChart;
