import * as React from 'react';
import { useCallback } from 'react';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import { createStyles, makeStyles } from '@material-ui/core/styles';

import { useWorkoutCreatorSelector } from 'state/reducers';
import {
	setFTP,
	setStepThreshold,
	setWindowRadius,
	setInputSmoothing,
	setDiscrepencySmoothing,
	generateIntervals
} from 'state/workout-creator/slice';
import { useAppDispatch, useDispatchCallback } from 'state/dispatch-hooks';

const useStyles = makeStyles(theme =>
	createStyles({
		root: {
			margin: 0,
			padding: theme.spacing(0, 2),
			width: 160
		},
		label: {
			padding: theme.spacing(1)
		}
	})
);

const NumericFormControlLabel = (props: {
	label: string;
	value: number;
	onChange: (v: number) => void;
}) => {
	const { label, value, onChange } = props;
	const formControlClasses = useStyles();

	return (
		<FormControlLabel
			classes={formControlClasses}
			control={
				<TextField
					type="number"
					variant="outlined"
					size="small"
					margin="none"
					value={value}
					onChange={e => onChange(parseFloat(e.target.value))}
				/>
			}
			label={label}
			labelPlacement="start"
		/>
	);
};

const SettingsFormGroup = () => {
	const { state, loadedActivity, isGenerating, ftp, params } = useWorkoutCreatorSelector(s => ({
		state: s,
		loadedActivity: s.activity,
		isGenerating: s.generatingFromActivity,
		ftp: s.ftp,
		params: s.generationParams
	}));

	const setFTPCallback = useDispatchCallback(setFTP);
	const setStepThresholdCallback = useDispatchCallback(setStepThreshold);
	const setWindowRadiusCallback = useDispatchCallback(setWindowRadius);
	const setInputSmoothingCallback = useDispatchCallback(setInputSmoothing);
	const setDiscrepencySmoothingCallback = useDispatchCallback(setDiscrepencySmoothing);

	const dispatch = useAppDispatch();
	const generateIntervalsDispatcher = useCallback(() => {
		if (loadedActivity) dispatch(generateIntervals(state));
	}, [dispatch, loadedActivity, state]);

	return (
		<FormGroup row>
			<NumericFormControlLabel label="FTP" value={ftp} onChange={setFTPCallback} />
			<NumericFormControlLabel
				label="Window Size"
				value={params.windowRadius}
				onChange={setWindowRadiusCallback}
			/>
			<NumericFormControlLabel
				label="Pre Smooth"
				value={params.inputSmoothingRadius}
				onChange={setInputSmoothingCallback}
			/>
			<NumericFormControlLabel
				label="Post Smooth"
				value={params.discrepencySmoothingRadius}
				onChange={setDiscrepencySmoothingCallback}
			/>
			<NumericFormControlLabel
				label="Step Threshold"
				value={params.stepThreshold}
				onChange={setStepThresholdCallback}
			/>
			<Button
				variant="contained"
				onClick={() => generateIntervalsDispatcher()}
				disabled={!loadedActivity || isGenerating}
			>
				Generate Intervals
			</Button>
		</FormGroup>
	);
};

export default SettingsFormGroup;
