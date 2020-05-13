import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import * as d3 from 'd3';

import Box, { BoxProps } from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import { Close } from '@material-ui/icons';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import XYPlot, { DataSeriesT } from 'ui/charts/xy-plot';
import GpxFileDrop, { FileAndGpx } from 'ui/file/gpx-file-drop';

import { formatSecondsAsHHMMSS } from 'shared/utils/time-format-utils';
import { buildNiceTimeTicksToDisplay } from 'shared/utils/chart-utils';
import { getAttributes, fromGPXData } from 'shared/activity-data/activity-container';

import { useDispatchCallback } from 'state/dispatch-hooks';
import { setActivity, clearActivity } from 'state/workout-creator/slice';
import {
	getActivityProcessedPowerTimeSeries,
	getMovingWindowDiscrepencyCurve,
	getDetectedStepTimePoints
} from 'state/workout-creator/selectors';
import { useWorkoutCreatorSelector } from 'state/reducers';

import SettingsFormGroup from './settings-form-group';

const ActivityLoadHeader = () => {
	const { loadedActivity } = useWorkoutCreatorSelector(s => ({
		loadedActivity: s.activity,
		isGenerating: s.generatingFromActivity,
		ftp: s.ftp
	}));

	const setActivityDispatcher = useDispatchCallback(setActivity);
	const clearActivitityDispatcher = useDispatchCallback(clearActivity);

	const addFiles = useCallback(
		(files: FileAndGpx[]) => {
			if (files.length > 0) {
				const { gpx } = files[0];
				setActivityDispatcher(fromGPXData(gpx));
			}
		},
		[setActivityDispatcher]
	);

	if (loadedActivity) {
		return (
			<>
				<IconButton aria-label="close file" onClick={() => clearActivitityDispatcher()}>
					<Close />
				</IconButton>
				<div style={{ marginRight: '20px' }}>
					<span>{`Loaded activity: ${getAttributes(loadedActivity).name}`}</span>
				</div>
			</>
		);
	}

	return <GpxFileDrop onAddFiles={addFiles} allowMultiple={false} />;
};

const stopClickFocusPropagation: Partial<BoxProps> = {
	onClick: event => event.stopPropagation(),
	onFocus: event => event.stopPropagation()
};

function buildPowerSeries(data: DataSeriesT['data']): DataSeriesT {
	return {
		name: 'power-vs-time',
		data,
		seriesType: 'line',
		color: '#551A8B'
	};
}

function buildDiscrepencyCurveSeries(data: DataSeriesT['data']): DataSeriesT {
	return {
		name: 'discrepency-curve',
		data,
		seriesType: 'line',
		color: '#ff6961'
	};
}

function buildDetectedStepsSeries(data: DataSeriesT['data']): DataSeriesT {
	return {
		name: 'detected-steps',
		data,
		seriesType: 'mark',
		color: 'red'
	};
}

const ActivityLoader = () => {
	const [showDiscrepencyCurve, setShowDiscrepencyCurve] = useState(false);
	const [showDetectedSteps, setShowDetectedSteps] = useState(false);

	const { powerData, discrepencyCurve, stepThreshold, detectedSteps } = useWorkoutCreatorSelector(
		s => ({
			powerData: getActivityProcessedPowerTimeSeries(s),
			discrepencyCurve: getMovingWindowDiscrepencyCurve(s),
			detectedSteps: getDetectedStepTimePoints(s),
			stepThreshold: s.generationParams.stepThreshold
		})
	);

	const powerDataSeries = useMemo(() => buildPowerSeries(powerData), [powerData]);

	const maxPower = useMemo(() => d3.max(powerData, p => p.y ?? 0) ?? 0, [powerData]);

	const discrepencyCurveSeries = useMemo(() => {
		const absolute = discrepencyCurve.map(d => ({ x: d.t, y: Math.abs(d.delta) }));
		const maxDelta = d3.max(absolute, a => a.y) ?? 0;
		const adjustment = maxDelta > 0 ? maxPower / maxDelta : 1.0;
		const normalised = absolute.map(a => ({
			...a,
			y: a.y > stepThreshold ? a.y * adjustment : null
		}));
		return buildDiscrepencyCurveSeries(normalised);
	}, [discrepencyCurve, maxPower, stepThreshold]);

	const detectedStepsSeries = useMemo(() => {
		const stepVsPower = detectedSteps.map(d => ({ x: d, y: powerData[d].y }));
		return buildDetectedStepsSeries(stepVsPower);
	}, [detectedSteps, powerData]);

	const activityXTicks = useMemo(() => {
		const maxX = powerData.length > 0 ? powerData[powerData.length - 1].x : 3600;
		return buildNiceTimeTicksToDisplay(maxX, 5);
	}, [powerData]);

	const allSeries = useMemo(
		() => [
			...(showDiscrepencyCurve ? [discrepencyCurveSeries] : []),
			powerDataSeries,
			...(showDetectedSteps ? [detectedStepsSeries] : [])
		],
		[
			detectedStepsSeries,
			discrepencyCurveSeries,
			powerDataSeries,
			showDetectedSteps,
			showDiscrepencyCurve
		]
	);

	return (
		<>
			<ExpansionPanel>
				<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
					<Box display="flex" flexDirection="column" {...stopClickFocusPropagation}>
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							minHeight="2em"
							width="100%"
							{...stopClickFocusPropagation}
						>
							<ActivityLoadHeader />
						</Box>
						<Box width="100%" {...stopClickFocusPropagation}>
							<SettingsFormGroup />
						</Box>
					</Box>
				</ExpansionPanelSummary>
				<ExpansionPanelDetails>
					<Box display="flex" flexDirection="column" width="100%">
						<FormGroup row>
							<FormControlLabel
								control={
									<Switch
										checked={showDiscrepencyCurve}
										onChange={e => setShowDiscrepencyCurve(e.target.checked)}
										name="showDCurve"
										color="secondary"
									/>
								}
								label="Show Discrepency Curve"
							/>
							<FormControlLabel
								control={
									<Switch
										checked={showDetectedSteps}
										onChange={e => setShowDetectedSteps(e.target.checked)}
										name="showSteps"
									/>
								}
								label="Show Steps"
							/>
						</FormGroup>
						<Box className="workout-creator-activity-data-chart">
							<XYPlot
								series={allSeries}
								xTickFormat={formatSecondsAsHHMMSS}
								xTickValues={activityXTicks}
								xAxisLabel="time"
								yAxisLabel="Power"
							/>
						</Box>
					</Box>
				</ExpansionPanelDetails>
			</ExpansionPanel>
		</>
	);
};

export default ActivityLoader;
