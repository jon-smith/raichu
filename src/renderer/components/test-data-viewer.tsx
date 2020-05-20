import React, { useMemo } from 'react';
import lodash from 'lodash';

import XYPlot, { DataSeriesT } from 'ui/charts/xy-plot';
import * as activityCalculator from 'shared/activity-data/activity-calculator';
import { ActivityContainer } from 'shared/activity-data/activity-container';
import { buildNiceTimeTicksToDisplay } from 'shared/utils/chart-utils';
import { formatSecondsAsHHMMSS } from 'shared/utils/time-format-utils';
import { useActivitySelector } from 'state/reducers';

import { getSelectedActivity } from 'state/activity-data/selectors';
import BestSplitPlotViewer from './activity-view/best-split-plot';
import ActivitySelectionForm from './activity-view/activity-selection-form';

function buildTimeSeries(
	d: ActivityContainer | undefined,
	v: activityCalculator.Variable,
	name: string
): DataSeriesT {
	return {
		name,
		data: d ? activityCalculator.getAsTimeSeries(d, v) : [],
		seriesType: 'line'
	};
}

const TestDataViewer = () => {
	const selectedActivity = useActivitySelector(s => getSelectedActivity(s));

	const timeSeries = useMemo(() => buildTimeSeries(selectedActivity, 'heartrate', 'hr-series'), [
		selectedActivity
	]);

	const maxTimeSeconds =
		useMemo(() => lodash.max(timeSeries.data.map(d => d.x)), [timeSeries]) ?? 0;

	const timeTicks = buildNiceTimeTicksToDisplay(maxTimeSeconds, 6);

	return (
		<div className="test-data-viewer">
			<ActivitySelectionForm />
			<XYPlot
				className="test-data-chart"
				series={[timeSeries]}
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
