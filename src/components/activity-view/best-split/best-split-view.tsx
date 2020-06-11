import React, { useMemo, useState } from 'react';

import Box from '@material-ui/core/Box';

import * as activityCalculator from 'library/activity-data/activity-calculator';
import { BestSplitOption } from 'library/activity-data/activity-calculator';
import { ActivityContainer } from 'library/activity-data/activity-container';
import { useActivitySelector } from 'store/reducers';
import { getSelectedActivity } from 'store/activity-data/selectors';
import { primaryColourForBestSplitOption } from 'components/helpers/activity-data-component-helpers';
import BestSplitCurveSelection from './best-split-curve-selection';
import BestSplitPlot from './best-split-plot';
import BestSplitTable from './best-split-table';
import { distancesForBestSplits, timeIntervalsForBestSplits } from './best-split-x-values';

function buildPaceCurve(d: ActivityContainer) {
	const bestSplits = activityCalculator.getMinTimesPerDistance(d, distancesForBestSplits);

	const bestSplitsDataPoints = bestSplits
		.filter((r) => r.best !== null)
		.map((r) => ({
			x: r.distance,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			y: r.distance / r.best!.time,
		}));

	return {
		data: bestSplitsDataPoints,
		color: primaryColourForBestSplitOption('speed'),
	};
}

function buildPowerCurve(d: ActivityContainer) {
	const bestSplits = activityCalculator.getBestSplitsVsTime(
		d,
		'power',
		timeIntervalsForBestSplits,
		10
	);

	const bestSplitsDataPoints = bestSplits.map((r) => ({
		x: r.distance,
		y: r.best?.average ?? null,
	}));

	return {
		data: bestSplitsDataPoints,
		color: primaryColourForBestSplitOption('power'),
	};
}

function buildHRCurve(d: ActivityContainer) {
	const bestSplits = activityCalculator.getBestSplitsVsTime(
		d,
		'heartrate',
		timeIntervalsForBestSplits,
		10
	);

	const bestSplitsDataPoints = bestSplits.map((r) => ({
		x: r.distance,
		y: r.best?.average ?? null,
	}));

	return {
		data: bestSplitsDataPoints,
		color: primaryColourForBestSplitOption('heartrate'),
	};
}

function getCurveBuilder(o: BestSplitOption) {
	switch (o) {
		case 'heartrate':
			return buildHRCurve;
		case 'power':
			return buildPowerCurve;
		case 'speed':
			return buildPaceCurve;
		default:
			return undefined;
	}
}

function useBestSplitChartData(o: BestSplitOption) {
	const selectedActivity = useActivitySelector((s) => getSelectedActivity(s));
	return useMemo(() => {
		const selectedActivities = selectedActivity ? [selectedActivity] : [];
		const curveBuilder = getCurveBuilder(o);
		if (curveBuilder)
			return selectedActivities.map((a) => ({ ...curveBuilder(a), name: a.filename }));

		return [];
	}, [selectedActivity, o]);
}

export default function BestSplitPlotComponent() {
	const [bestSplitOption, setBestSplitOption] = useState<BestSplitOption>('power');

	const data = useBestSplitChartData(bestSplitOption);

	return (
		<>
			<BestSplitCurveSelection option={bestSplitOption} onChange={setBestSplitOption} />
			<Box display="flex" flexDirection="row" flexWrap="wrap" width="100%">
				<Box flex="3 1 0" style={{ minWidth: 400 }}>
					<BestSplitPlot series={data} option={bestSplitOption} />
				</Box>
				<Box flex="1 1 0" style={{ minWidth: 400 }}>
					<BestSplitTable option={bestSplitOption} series={data} />
				</Box>
			</Box>
		</>
	);
}
