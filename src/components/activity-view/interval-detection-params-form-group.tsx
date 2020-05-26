import React from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import { createStyles, makeStyles } from '@material-ui/core/styles';

import { useIntervalDetectionSelector } from 'store/reducers';
import {
	setFTP,
	setStepThreshold,
	setWindowRadius,
	setInputSmoothing,
	setDiscrepencySmoothing,
} from 'store/interval-detection/slice';
import { useDispatchCallback } from 'store/dispatch-hooks';

const useFormControlStyles = makeStyles((theme) =>
	createStyles({
		root: {
			margin: 0,
			padding: theme.spacing(0, 2),
		},
		label: {
			padding: theme.spacing(1),
		},
	})
);

const useTextFieldStyles = makeStyles((theme) =>
	createStyles({
		root: {
			width: 100,
		},
	})
);

const NumericFormControlLabel = (props: {
	label: string;
	value: number;
	onChange: (v: number) => void;
}) => {
	const { label, value, onChange } = props;

	const formControlClasses = useFormControlStyles();
	const textFieldClasses = useTextFieldStyles();

	return (
		<FormControlLabel
			classes={formControlClasses}
			control={
				<TextField
					classes={textFieldClasses}
					type="number"
					variant="outlined"
					size="small"
					margin="none"
					value={value}
					onChange={(e) => onChange(parseFloat(e.target.value))}
				/>
			}
			label={label}
			labelPlacement="start"
		/>
	);
};

const SettingsFormGroup = () => {
	const { ftp, params } = useIntervalDetectionSelector((s) => ({
		ftp: s.ftp,
		params: s.generationParams,
	}));

	const setFTPCallback = useDispatchCallback(setFTP);
	const setStepThresholdCallback = useDispatchCallback(setStepThreshold);
	const setWindowRadiusCallback = useDispatchCallback(setWindowRadius);
	const setInputSmoothingCallback = useDispatchCallback(setInputSmoothing);
	const setDiscrepencySmoothingCallback = useDispatchCallback(setDiscrepencySmoothing);

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
		</FormGroup>
	);
};

export default SettingsFormGroup;
