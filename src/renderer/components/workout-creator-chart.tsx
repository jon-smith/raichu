import * as React from 'react';
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

type DataItem = { category: string; value: number };

const buildChart = (nodeRef: SVGSVGElement, width: number, height: number) => {
	const svg = d3.select(nodeRef).html('');

	const padding = { top: 20, left: 20, right: 20, bottom: 20 };

	const xScale = d3.scaleBand();
	const yScale = d3.scaleLinear();

	const color = d3.schemeCategory10;

	const xAxis = d3.axisBottom(xScale);

	const data: DataItem[] = [
		{ category: 'A', value: 50 },
		{ category: 'B', value: 30 },
		{ category: 'C', value: 20 },
		{ category: 'D', value: 20 }
	];

	const drag = d3
		.drag<SVGRectElement, DataItem>()
		.on('start', (d, i, j) => {
			const bar = d3.select(j[i]);
			const mouseX = d3.mouse(j[i])[0];
			const barX = parseFloat(bar.attr('x'));

			// Store the x coordinate of bar when the dragging starts
			bar.property('startX', barX);
			// Store offset to mouse
			bar.property('xDiff', mouseX - barX);

			// Bring the bar to the front
			if (bar.node()) {
				nodeRef.appendChild(bar.node()!);
			}
		})
		.on('drag', (d, i, j) => {
			const curBar = d3.select(j[i]);
			const curIdx = data.indexOf(d);
			const startX = curBar.property('startX');
			const mouseX = d3.mouse(j[i])[0];
			const newX = mouseX - curBar.property('xDiff');
			const xRange = (xScale.range()[1] - xScale.range()[0]) / 2;
			const backlash = xScale.bandwidth() / 2.5;

			if (newX < xScale.range()[0] - backlash || xScale.range()[data.length - 1] + backlash < newX)
				return;

			curBar.attr('x', newX);

			// Get the index of the nearest bar
			const nearestIdx = (() => {
				if (curIdx === 0) return 1;

				if (newX < startX || curIdx === data.length - 1) return curIdx - 1;

				return curIdx + 1;
			})();

			const nearestBar = d3
				.selectAll<SVGRectElement, DataItem>('.bar')
				.filter((d2: DataItem) => d2 === data[nearestIdx]);

			const nearestX = +nearestBar.attr('x');

			// If the current bar is moved close enough to the nearest bar,
			// then update the order of the data array. For example, if we are dragging
			// the first bar and moving to right, the order will be [a, b, c] to [b, a, c]
			if (startX + xRange < newX || newX < startX - xRange) {
				const tmp = data[curIdx];
				data[curIdx] = data[nearestIdx];
				data[nearestIdx] = tmp;

				curBar.property('startX', nearestX);

				xScale.domain(data.map(d2 => d2.category));

				svg
					.select<SVGSVGElement>('.x.axis')
					.transition()
					.duration(200)
					.call(d3.axisBottom(xScale));

				nearestBar
					.transition()
					.duration(100)
					.attr('x', xScale(nearestBar.datum().category) ?? 0);
			}
		})
		.on('end', (d: DataItem, i, j) => {
			const bar = d3.select(j[i]);
			bar
				.transition()
				.duration(300)
				.attr('x', xScale(d.category) ?? 0);
		});

	xScale
		.domain(data.map(d => d.category))
		.rangeRound([padding.left, width - padding.right])
		.padding(0.3);

	yScale.domain([0, d3.max(data, d => d.value) ?? 0]).range([height - padding.bottom, padding.top]);

	svg
		.selectAll('rect')
		.data(data)
		.enter()
		.append('rect')
		.attr('width', xScale.bandwidth())
		.attr('height', d => height - padding.bottom - yScale(d.value))
		.attr('x', (d: DataItem) => xScale(d.category) ?? 0)
		.attr('y', (d: DataItem) => yScale(d.value) ?? 0)
		.attr('fill', (_, i) => color[i])
		.attr('class', 'bar')
		.call(drag);

	svg
		.append('g')
		.attr('transform', `translate(${0},${height - padding.bottom})`)
		.attr('class', 'x axis')
		.call(xAxis);
};

const WorkoutCreatorChart = () => {
	const svgRef = useRef<SVGSVGElement>(null);

	const width = 400;
	const height = 400;

	useEffect(() => {
		if (svgRef.current) {
			buildChart(svgRef.current, width, height);
		}
	}, []);

	return <svg ref={svgRef} width={width} height={height} />;
};

export default WorkoutCreatorChart;
