import * as React from 'react';
import { useState, useCallback } from 'react';
import Box from '@material-ui/core/Box';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import { Undo, Redo, Add } from '@material-ui/icons';
import { createStyles, makeStyles } from '@material-ui/core/styles';

import * as moment from 'moment';
import TimePicker from 'rc-time-picker';

import { useWorkoutCreatorSelector } from '@/state/reducers';
import { useDispatchCallback } from '@/state/actions';
import * as WorkoutCreatorActions from '@/state/actions/workout-creator-actions';
import { canUndo, canRedo } from '@/state/reducers/workout-creator-reducer';
import WorkoutCreatorChart from './workout-creator-chart';

const useStyles = makeStyles(theme =>
	createStyles({
		root: {
			padding: theme.spacing(0, 2),
			width: 160
		},
		label: {
			padding: theme.spacing(1)
		}
	})
);

const totalSeconds = (m: moment.Moment) => m.unix();

const WorkoutCreatorPage = () => {
	const { intervals, undoEnabled, redoEnabled } = useWorkoutCreatorSelector(w => ({
		intervals: w.currentIntervals,
		undoEnabled: canUndo(w),
		redoEnabled: canRedo(w)
	}));

	const [currentDuration, setCurrentDuration] = useState(moment(0));
	const [currentIntensity, setCurrentIntensity] = useState(100);

	const setIntervals = useDispatchCallback(WorkoutCreatorActions.setIntervals);
	const undo = useDispatchCallback(WorkoutCreatorActions.undo);
	const redo = useDispatchCallback(WorkoutCreatorActions.redo);

	const intervalDuration = totalSeconds(currentDuration);

	const addInterval = useCallback(() => {
		if (intervalDuration > 0) {
			setIntervals([
				...intervals,
				{ color: 'red', intensity: currentIntensity * 0.01, length: intervalDuration }
			]);
		}
	}, [intervalDuration, currentIntensity, intervals, setIntervals]);

	const formControlClasses = useStyles();

	return (
		<Box display="flex" flexDirection="column">
			<FormGroup row>
				<IconButton aria-label="undo" disabled={!undoEnabled} onClick={undo}>
					<Undo />
				</IconButton>
				<IconButton aria-label="redo" disabled={!redoEnabled} onClick={redo}>
					<Redo />
				</IconButton>
				<FormControlLabel
					classes={formControlClasses}
					control={
						<TimePicker
							value={currentDuration}
							onChange={d => setCurrentDuration(d ?? moment(0))}
							showHour={false}
							showMinute={true}
							showSecond={true}
						/>
					}
					label="Duration"
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
							value={currentIntensity}
							onChange={e => setCurrentIntensity(parseFloat(e.target.value))}
						/>
					}
					label="Intensity"
					labelPlacement="start"
				/>
				<IconButton aria-label="add" onClick={addInterval} disabled={intervalDuration === 0}>
					<Add />
				</IconButton>
			</FormGroup>
			<Box>
				<WorkoutCreatorChart intervals={intervals} setIntervals={setIntervals} />
			</Box>
		</Box>
	);
};

export default WorkoutCreatorPage;
