import * as React from 'react';
import { useCallback, useMemo } from 'react';

import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import { Close } from '@material-ui/icons';

import XYPlot, { DataSeriesT } from 'ui/charts/xy-plot';
import GpxFileDrop, { FileAndGpx } from 'ui/file/gpx-file-drop';

import { formatSecondsAsHHMMSS } from 'shared/utils/time-format-utils';
import { buildNiceTimeTicksToDisplay } from 'shared/utils/chart-utils';

import { useDispatchCallback } from 'state/dispatch-hooks';
import {
	setActivity,
	clearActivity,
	getActivityProcessedPowerTimeSeries
} from 'state/workout-creator/workout-creator-slice';
import { useWorkoutCreatorSelector } from 'state/reducers';

const ActivityLoader = () => {
	const { loadedActivity, powerData } = useWorkoutCreatorSelector(s => ({
		loadedActivity: s.activity,
		powerData: getActivityProcessedPowerTimeSeries(s)
	}));

	const setActivityDispatcher = useDispatchCallback(setActivity);
	const clearActivitityDispatcher = useDispatchCallback(clearActivity);

	const addFiles = useCallback(
		(files: FileAndGpx[]) => {
			if (files.length > 0) {
				const { gpx } = files[0];
				setActivityDispatcher(gpx);
			}
		},
		[setActivityDispatcher]
	);

	const powerDataSeries = useMemo(
		(): DataSeriesT[] => [
			{
				name: 'power-vs-time',
				data: powerData,
				seriesType: 'line'
			}
		],
		[powerData]
	);

	const maxX = useMemo(() => (powerData.length > 0 ? powerData[powerData.length - 1].x : 3600), [
		powerData
	]);

	return (
		<>
			<Box display="flex" flexDirection="row" alignItems="center" margin="10px" minHeight="2em">
				{loadedActivity ? (
					<>
						<span>{`Loaded activity: ${loadedActivity.track.name}`}</span>
						<IconButton aria-label="close file" onClick={() => clearActivitityDispatcher()}>
							<Close />
						</IconButton>
					</>
				) : (
					<GpxFileDrop onAddFiles={addFiles} allowMultiple={false} />
				)}
			</Box>
			<Box>
				<XYPlot
					className="test-data-chart"
					series={powerDataSeries}
					xTickFormat={formatSecondsAsHHMMSS}
					xTickValues={buildNiceTimeTicksToDisplay(maxX, 5)}
					xAxisLabel="time"
					yAxisLabel="Power"
				/>
			</Box>
		</>
	);
};

export default ActivityLoader;
