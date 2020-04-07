import * as React from 'react';
import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { batchActions } from 'redux-batched-actions';

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
import { canUndo, canRedo, selectedInterval } from '@/state/reducers/workout-creator-reducer';

import { Interval } from '@/state/actions/workout-creator-actions';
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
	const {
		intervals,
		selectedIndex,
		currentSelectedInterval,
		undoEnabled,
		redoEnabled
	} = useWorkoutCreatorSelector(w => ({
		intervals: w.currentIntervals,
		selectedIndex: w.selectedIndex,
		currentSelectedInterval: selectedInterval(w),
		undoEnabled: canUndo(w),
		redoEnabled: canRedo(w)
	}));

	const setIntervals = useDispatchCallback(WorkoutCreatorActions.setIntervals);
	const undo = useDispatchCallback(WorkoutCreatorActions.undo);
	const redo = useDispatchCallback(WorkoutCreatorActions.redo);

	const [newIntervalDuration, setNewIntervalDuration] = useState(0);
	const [newIntervalIntensity, setNewIntervalIntensity] = useState(1);

	const intervalDuration = currentSelectedInterval?.length ?? newIntervalDuration;
	const setIntervalDuration = useCallback(
		(m: moment.Moment | null) => {
			const seconds = m?.unix() ?? 0;
			if (currentSelectedInterval === null) {
				setNewIntervalDuration(seconds);
			} else if (selectedIndex !== null) {
				const updatedIntervals = intervals.slice();
				updatedIntervals[selectedIndex] = {
					...updatedIntervals[selectedIndex],
					length: seconds
				};
				setIntervals(updatedIntervals);
			}
		},
		[currentSelectedInterval, intervals, selectedIndex, setIntervals]
	);

	const intervalIntensity = currentSelectedInterval?.intensity ?? newIntervalIntensity;
	const setIntervalIntensity = useCallback(
		(i: number) => {
			if (currentSelectedInterval === null) {
				setNewIntervalIntensity(i);
			} else if (selectedIndex !== null) {
				const updatedIntervals = intervals.slice();
				updatedIntervals[selectedIndex] = {
					...updatedIntervals[selectedIndex],
					intensity: i
				};
				setIntervals(updatedIntervals);
			}
		},
		[currentSelectedInterval, intervals, selectedIndex, setIntervals]
	);

	const dispatch = useDispatch();
	const onChange = useCallback(
		(newIntervals: Interval[], newIndex: number | null) => {
			// Batch the interval and index updates to prevent flicker on multiple rerender
			dispatch(
				batchActions([
					WorkoutCreatorActions.setIntervals(newIntervals),
					WorkoutCreatorActions.setSelectedIndex(newIndex)
				])
			);
		},
		[dispatch]
	);

	const addInterval = useCallback(() => {
		if (newIntervalDuration > 0) {
			setIntervals([
				...intervals,
				{ color: 'red', intensity: newIntervalIntensity, length: newIntervalDuration }
			]);
		}
	}, [newIntervalDuration, setIntervals, intervals, newIntervalIntensity]);

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
							value={moment.utc(intervalDuration * 1000)}
							onChange={d => setIntervalDuration(d)}
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
							value={intervalIntensity * 100}
							onChange={e => setIntervalIntensity(parseFloat(e.target.value) * 0.01)}
						/>
					}
					label="Intensity"
					labelPlacement="start"
				/>
				<IconButton
					aria-label="add"
					onClick={addInterval}
					disabled={newIntervalDuration === 0 || selectedIndex !== null}
				>
					<Add />
				</IconButton>
			</FormGroup>
			<Box>
				<WorkoutCreatorChart
					intervals={intervals}
					selectedIndex={selectedIndex}
					onChange={onChange}
				/>
			</Box>
		</Box>
	);
};

export default WorkoutCreatorPage;
