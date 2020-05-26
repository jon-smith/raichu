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

import XYPlot, { DataSeriesT } from 'generic-components/charts/xy-plot';
import ActivityFileDrop, {
	FileAndData,
	extractActivityData,
} from 'generic-components/file/activity-file-drop';

import { formatSecondsAsHHMMSS } from 'library/utils/time-format-utils';
import { buildNiceTimeTicksToDisplay } from 'library/utils/chart-utils';
import { getAttributes } from 'library/activity-data/activity-container';

import { useDispatchCallback } from 'store/dispatch-hooks';
import { setActivity, clearActivity } from 'store/workout-creator/slice';
import { getDetectedIntervals } from 'store/workout-creator/selectors';
import { useWorkoutCreatorSelector } from 'store/reducers';

import SettingsFormGroup from './settings-form-group';

const ActivityLoadHeader = () => {
	const { loadedActivity } = useWorkoutCreatorSelector((s) => ({
		loadedActivity: s.activity,
		isGenerating: s.generatingFromActivity,
		ftp: s.ftp,
	}));

	const setActivityDispatcher = useDispatchCallback(setActivity);
	const clearActivitityDispatcher = useDispatchCallback(clearActivity);

	const addFiles = useCallback(
		(files: FileAndData[]) => {
			if (files.length > 0) {
				const { data } = files[0];
				const activities = extractActivityData(data);
				if (activities.length > 0) {
					setActivityDispatcher(activities[0]);
				}
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

	return <ActivityFileDrop onAddFiles={addFiles} allowMultiple={false} />;
};

const stopClickFocusPropagation: Partial<BoxProps> = {
	onClick: (event) => event.stopPropagation(),
	onFocus: (event) => event.stopPropagation(),
};

function buildPowerSeries(data: DataSeriesT['data']): DataSeriesT {
	return {
		name: 'power-vs-time',
		data,
		seriesType: 'line',
		color: '#551A8B',
	};
}

function buildDiscrepencyCurveSeries(data: DataSeriesT['data']): DataSeriesT {
	return {
		name: 'discrepency-curve',
		data,
		seriesType: 'line',
		color: '#ff6961',
	};
}

function buildDetectedStepsSeries(data: DataSeriesT['data']): DataSeriesT {
	return {
		name: 'detected-steps',
		data,
		seriesType: 'mark',
		color: 'red',
	};
}

const FormSwitch = (params: {
	label: string;
	value: boolean;
	setValue: (v: boolean) => void;
	name: string;
	color?: 'primary' | 'secondary';
}) => {
	const { label, value, setValue, name, color } = params;
	return (
		<FormControlLabel
			control={
				<Switch
					checked={value}
					onChange={(e) => setValue(e.target.checked)}
					name={name}
					color={color}
				/>
			}
			label={label}
		/>
	);
};

const ActivityChart = () => {
	const [showDiscrepencyCurve, setShowDiscrepencyCurve] = useState(false);
	const [showDetectedSteps, setShowDetectedSteps] = useState(false);
	const [showSmoothedInput, setShowSmoothedInput] = useState(false);

	const {
		rawInput,
		smoothedInput,
		discrepencyCurve,
		stepThreshold,
		detectedStepTimePoints,
	} = useWorkoutCreatorSelector((s) => ({
		...getDetectedIntervals(s),
		stepThreshold: s.generationParams.stepThreshold,
	}));

	const powerData = showSmoothedInput ? smoothedInput : rawInput;

	const maxPower = useMemo(() => d3.max(rawInput, (p) => p.y ?? 0) ?? 0, [rawInput]);

	const powerDataSeries = useMemo(() => buildPowerSeries(powerData), [powerData]);

	const discrepencyCurveSeries = useMemo(() => {
		const absolute = discrepencyCurve.map((d) => ({ x: d.t, y: Math.abs(d.delta) }));
		const maxDelta = d3.max(absolute, (a) => a.y) ?? 0;
		const adjustment = maxDelta > 0 ? maxPower / maxDelta : 1.0;
		const normalised = absolute.map((a) => ({
			...a,
			y: a.y > stepThreshold ? a.y * adjustment : null,
		}));
		return buildDiscrepencyCurveSeries(normalised);
	}, [discrepencyCurve, maxPower, stepThreshold]);

	const detectedStepsSeries = useMemo(() => {
		const stepVsPower = detectedStepTimePoints.map((d) => ({ x: d, y: powerData[d].y }));
		return buildDetectedStepsSeries(stepVsPower);
	}, [detectedStepTimePoints, powerData]);

	const activityXTicks = useMemo(() => {
		const maxX = powerData.length > 0 ? powerData[powerData.length - 1].x : 3600;
		return buildNiceTimeTicksToDisplay(maxX, 5);
	}, [powerData]);

	const allSeries = useMemo(
		() => [
			...(showDiscrepencyCurve ? [discrepencyCurveSeries] : []),
			powerDataSeries,
			...(showDetectedSteps ? [detectedStepsSeries] : []),
		],
		[
			detectedStepsSeries,
			discrepencyCurveSeries,
			powerDataSeries,
			showDetectedSteps,
			showDiscrepencyCurve,
		]
	);

	return (
		<Box display="flex" flexDirection="column" width="100%">
			<FormGroup row>
				<FormSwitch
					label="Show Smoothed Power"
					name="showSmooth"
					color="secondary"
					value={showSmoothedInput}
					setValue={setShowSmoothedInput}
				/>
				<FormSwitch
					label="Show Discrepency Curve"
					name="showDCurve"
					color="secondary"
					value={showDiscrepencyCurve}
					setValue={setShowDiscrepencyCurve}
				/>
				<FormSwitch
					label="Show Steps"
					name="showSteps"
					value={showDetectedSteps}
					setValue={setShowDetectedSteps}
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
	);
};

const ActivityLoader = () => (
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
				<ActivityChart />
			</ExpansionPanelDetails>
		</ExpansionPanel>
	</>
);

export default ActivityLoader;
