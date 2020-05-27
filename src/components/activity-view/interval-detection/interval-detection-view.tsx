import React, { useMemo, useState, useCallback, useEffect } from 'react';
import * as d3 from 'd3';

import Box, { BoxProps } from '@material-ui/core/Box';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';

import XYPlot, { DataSeriesT } from 'generic-components/charts/xy-plot';
import IntervalEditorPlot from 'generic-components/charts/interval-editor-plot';

import { formatSecondsAsHHMMSS } from 'library/utils/time-format-utils';
import { buildNiceTimeTicksToDisplay } from 'library/utils/chart-utils';

import { useIntervalDetectionSelector, useActivitySelector } from 'store/reducers';
import { setCurrentPage } from 'store/view/slice';
import { setIntervals } from 'store/workout-creator/slice';

import ParamsForm from './interval-detection-params-form-group';
import { getSelectedActivity } from 'store/activity-data/selectors';
import { performIntervalDetection } from 'library/activity-data/interval-detection';
import { useDispatchCallback, useAppDispatch } from 'store/dispatch-hooks';
import { generateIntervals } from 'store/interval-detection/slice';

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

type IntervalDetectionResultT = ReturnType<typeof performIntervalDetection>;

const ActivityChart = (props: IntervalDetectionResultT) => {
	const [showDiscrepencyCurve, setShowDiscrepencyCurve] = useState(false);
	const [showDetectedSteps, setShowDetectedSteps] = useState(false);
	const [showSmoothedInput, setShowSmoothedInput] = useState(false);

	const { params } = useIntervalDetectionSelector((s) => ({
		params: s.generationParams,
		ftp: s.ftp,
	}));

	const { rawInput, smoothedInput, discrepencyCurve, detectedStepTimePoints } = props;

	const powerData = showSmoothedInput ? smoothedInput : rawInput;

	const maxPower = useMemo(() => d3.max(rawInput, (p) => p.y ?? 0) ?? 0, [rawInput]);

	const powerDataSeries = useMemo(() => buildPowerSeries(powerData), [powerData]);

	const { stepThreshold } = params;

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

const IntervalDetectionView = () => {
	const activity = useActivitySelector((s) => getSelectedActivity(s));

	const { params, ftp, results } = useIntervalDetectionSelector((s) => ({
		params: s.generationParams,
		ftp: s.ftp,
		results: s.detectionResults,
	}));

	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(generateIntervals({ activity, ftp, params }));
	}, [activity, ftp, params, dispatch]);

	const { intervals } = results;

	const setIntervalsDispatcher = useDispatchCallback(setIntervals);
	const setCurrentPageDispatcher = useDispatchCallback(setCurrentPage);
	const openInEditor = useCallback(() => {
		setIntervalsDispatcher(intervals);
		setCurrentPageDispatcher('workout-creator');
	}, [setIntervalsDispatcher, setCurrentPageDispatcher, intervals]);

	return (
		<>
			<ExpansionPanel>
				<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
					<Box display="flex" flexDirection="column" {...stopClickFocusPropagation}>
						<Box width="100%" {...stopClickFocusPropagation}>
							<ParamsForm />
						</Box>
					</Box>
				</ExpansionPanelSummary>
				<ExpansionPanelDetails>
					<ActivityChart {...results} />
				</ExpansionPanelDetails>
			</ExpansionPanel>
			<Box height="50vh">
				<IntervalEditorPlot intervals={intervals} />
				<Button variant="contained" onClick={openInEditor} disabled={!activity}>
					Open in editor
				</Button>
			</Box>
		</>
	);
};

export default IntervalDetectionView;
