import React, { useMemo, useState } from 'react';
import lodash from 'lodash';

import XYPlot, { DataSeriesT } from 'generic-components/charts/xy-plot';
import { getAsTimeSeries, Variable } from 'library/activity-data/activity-calculator';
import { ActivityContainer } from 'library/activity-data/activity-container';
import { buildNiceTimeTicksToDisplay } from 'library/utils/chart-utils';
import { formatSecondsAsHHMMSS } from 'library/utils/time-format-utils';
import { useActivitySelector } from 'store/reducers';
import { getSelectedActivity } from 'store/activity-data/selectors';
import {
	primaryColourForVariable,
	axisLabelForVariable,
} from 'components/helpers/activity-data-component-helpers';

import TimeSeriesSelection from './time-series-selection';

function buildTimeSeries(d: ActivityContainer | undefined, v: Variable, name: string): DataSeriesT {
	return {
		name,
		data: d ? getAsTimeSeries(d, v) : [],
		seriesType: 'line',
		color: primaryColourForVariable(v),
	};
}

const TimeSeriesDataViewer = () => {
	const [variableOption, setVariableOption] = useState<Variable>('power');

	const selectedActivity = useActivitySelector((s) => getSelectedActivity(s));

	const timeSeries = useMemo(
		() => buildTimeSeries(selectedActivity, variableOption, 'time-series'),
		[selectedActivity, variableOption]
	);

	const maxTimeSeconds =
		useMemo(() => lodash.max(timeSeries.data.map((d) => d.x)), [timeSeries]) ?? 0;

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
				yAxisLabel={axisLabelForVariable(variableOption)}
			/>
		</>
	);
};

export default TimeSeriesDataViewer;
