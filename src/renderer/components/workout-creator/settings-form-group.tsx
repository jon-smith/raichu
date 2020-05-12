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

const SettingsFormGroup = () => {
	const formControlClasses = useStyles();

	const { loadedActivity, isGenerating, ftp, params } = useWorkoutCreatorSelector(s => ({
		loadedActivity: s.activity,
		isGenerating: s.generatingFromActivity,
		ftp: s.ftp,
		params: s.generationParams
	}));

	const setFTPCallback = useDispatchCallback(setFTP);
	const setStepThresholdCallback = useDispatchCallback(setStepThreshold);
	const setWindowRadiusCallback = useDispatchCallback(setWindowRadius);

	const dispatch = useAppDispatch();
	const generateIntervalsDispatcher = useCallback(() => {
		if (loadedActivity) dispatch(generateIntervals({ activity: loadedActivity, ftp, params }));
	}, [dispatch, loadedActivity, ftp, params]);

	return (
		<FormGroup row>
			<FormControlLabel
				classes={formControlClasses}
				control={
					<TextField
						type="number"
						variant="outlined"
						size="small"
						margin="none"
						value={ftp}
						onChange={e => setFTPCallback(parseFloat(e.target.value))}
					/>
				}
				label="FTP"
				labelPlacement="start"
			/>
			<FormControlLabel
				classes={formControlClasses}
				control={
					<TextField
						type="number"
						variant="outlined"
						size="small"
						margin="none"
						value={params.windowRadius}
						onChange={e => setWindowRadiusCallback(parseFloat(e.target.value))}
					/>
				}
				label="Window Size"
				labelPlacement="start"
			/>
			<FormControlLabel
				classes={formControlClasses}
				control={
					<TextField
						type="number"
						variant="outlined"
						size="small"
						margin="none"
						value={params.stepThreshold}
						onChange={e => setStepThresholdCallback(parseFloat(e.target.value))}
					/>
				}
				label="Step Threshold"
				labelPlacement="start"
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
