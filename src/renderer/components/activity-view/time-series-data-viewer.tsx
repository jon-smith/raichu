import React, { useMemo, useState } from 'react';
import lodash from 'lodash';

import XYPlot, { DataSeriesT } from 'ui/charts/xy-plot';
import { getAsTimeSeries, Variable } from 'shared/activity-data/activity-calculator';
import { ActivityContainer } from 'shared/activity-data/activity-container';
import { buildNiceTimeTicksToDisplay } from 'shared/utils/chart-utils';
import { formatSecondsAsHHMMSS } from 'shared/utils/time-format-utils';
import { useActivitySelector } from 'state/reducers';

import { getSelectedActivity } from 'state/activity-data/selectors';
import TimeSeriesSelection from './time-series-selection';

function buildTimeSeries(d: ActivityContainer | undefined, v: Variable, name: string): DataSeriesT {
	return {
		name,
		data: d ? getAsTimeSeries(d, v) : [],
		seriesType: 'line'
	};
}

function yAxisLabel(o: Variable) {
	switch (o) {
		case 'heartrate':
			return 'HR';
		case 'cadence':
			return 'Cadence';
		case 'power':
			return 'Power (W)';
		default:
			return '';
	}
}

const TimeSeriesDataViewer = () => {
	const [variableOption, setVariableOption] = useState<Variable>('power');

	const selectedActivity = useActivitySelector(s => getSelectedActivity(s));

	const timeSeries = useMemo(
		() => buildTimeSeries(selectedActivity, variableOption, 'time-series'),
		[selectedActivity, variableOption]
	);

	const maxTimeSeconds =
		useMemo(() => lodash.max(timeSeries.data.map(d => d.x)), [timeSeries]) ?? 0;

	const timeTicks = buildNiceTimeTicksToDisplay(maxTimeSeconds, 6);

	return (
		<>
			<TimeSeriesSelection option={variableOption} onChange={setVariableOption} />
			<XYPlot
				className="test-data-chart"
				series={[timeSeries]}
				xTickFormat={formatSecondsAsHHMMSS}
				xTickValues={timeTicks}
				xAxisLabel="time"
				yAxisLabel={yAxisLabel(variableOption)}
			/>
		</>
	);
};

export default TimeSeriesDataViewer;
