import * as React from 'react';
import { useCallback, useMemo } from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { Close } from '@material-ui/icons';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import XYPlot, { DataSeriesT } from 'ui/charts/xy-plot';
import GpxFileDrop, { FileAndGpx } from 'ui/file/gpx-file-drop';

import { formatSecondsAsHHMMSS } from 'shared/utils/time-format-utils';
import { buildNiceTimeTicksToDisplay } from 'shared/utils/chart-utils';

import { useDispatchCallback } from 'state/dispatch-hooks';
import { setActivity, clearActivity } from 'state/workout-creator/slice';
import { getActivityProcessedPowerTimeSeries } from 'state/workout-creator/selectors';
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

	const activityXTicks = useMemo(() => {
		const maxX = powerData.length > 0 ? powerData[powerData.length - 1].x : 3600;
		return buildNiceTimeTicksToDisplay(maxX, 5);
	}, [powerData]);

	return (
		<>
			<ExpansionPanel>
				<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						minHeight="2em"
						width="100%"
						onClick={event => event.stopPropagation()}
						onFocus={event => event.stopPropagation()}
					>
						{loadedActivity ? (
							<>
								<span>{`Loaded activity: ${loadedActivity.track.name}`}</span>
								<Button variant="contained">Generate</Button>
								<IconButton aria-label="close file" onClick={() => clearActivitityDispatcher()}>
									<Close />
								</IconButton>
							</>
						) : (
							<GpxFileDrop onAddFiles={addFiles} allowMultiple={false} />
						)}
					</Box>
				</ExpansionPanelSummary>
				<ExpansionPanelDetails>
					<Box className="workout-creator-activity-data-chart">
						<XYPlot
							series={powerDataSeries}
							xTickFormat={formatSecondsAsHHMMSS}
							xTickValues={activityXTicks}
							xAxisLabel="time"
							yAxisLabel="Power"
						/>
					</Box>
				</ExpansionPanelDetails>
			</ExpansionPanel>
		</>
	);
};

export default ActivityLoader;
