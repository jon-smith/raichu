import React, { useMemo } from 'react';
import lodash from 'lodash';

import XYPlot, { DataSeriesT } from 'ui/charts/xy-plot';
import * as activityCalculator from 'shared/activity-data/activity-calculator';
import { ActivityContainer } from 'shared/activity-data/activity-container';
import { buildNiceTimeTicksToDisplay } from 'shared/utils/chart-utils';
import { formatSecondsAsHHMMSS } from 'shared/utils/time-format-utils';
import { useActivitySelector } from 'state/reducers';

import BestSplitPlotViewer from './activity-view/best-split-plot';

function buildTimeSeries(
	d: ActivityContainer,
	v: activityCalculator.Variable,
	name: string
): DataSeriesT {
	return {
		name,
		data: activityCalculator.getAsTimeSeries(d, v),
		seriesType: 'line'
	};
}

const TestDataViewer = () => {
	const loadedActivities = useActivitySelector(s => s.activities);

	const { timeSeries } = useMemo(
		() => ({
			timeSeries: loadedActivities.map(d => buildTimeSeries(d, 'heartrate', 'hr-series'))
		}),
		[loadedActivities]
	);

	const maxTimeSeconds =
		useMemo(() => lodash.max(timeSeries.flatMap(t => t.data.map(d => d.x))), [timeSeries]) ?? 0;

	const timeTicks = buildNiceTimeTicksToDisplay(maxTimeSeconds, 6);

	return (
		<div className="test-data-viewer">
			<XYPlot
				className="test-data-chart"
				series={timeSeries}
				xTickFormat={formatSecondsAsHHMMSS}
				xTickValues={timeTicks}
				xAxisLabel="time"
				yAxisLabel="HR"
			/>
			<BestSplitPlotViewer />
		</div>
	);
};

export default TestDataViewer;
