import * as React from 'react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { batchActions } from 'redux-batched-actions';

import { remote } from 'electron';
import * as fs from 'fs';

import Box from '@material-ui/core/Box';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import { Undo, Redo, Add, Save, Delete } from '@material-ui/icons';
import { createStyles, makeStyles } from '@material-ui/core/styles';

import * as moment from 'moment';
import TimePicker from 'rc-time-picker';

import { useWorkoutCreatorSelector } from 'state/reducers';
import { useDispatchCallback } from 'state/actions';
import {
	Interval,
	canUndo,
	canRedo,
	selectedOrNewInterval,
	intervalsWithColor,
	actions as WorkoutCreatorActions
} from 'state/workout-creator/workout-creator-slice';
import { buildMRCFileString } from 'shared/activity-data/export-mrc';

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

const useActions = () => {
	const setIntervals = useDispatchCallback(WorkoutCreatorActions.setIntervals);
	const undo = useDispatchCallback(WorkoutCreatorActions.undo);
	const redo = useDispatchCallback(WorkoutCreatorActions.redo);
	const setSelectedIntensity = useDispatchCallback(WorkoutCreatorActions.setSelectedIntensity);
	const setSelectedLength = useDispatchCallback(WorkoutCreatorActions.setSelectedLength);

	return {
		setIntervals,
		undo,
		redo,
		setSelectedIntensity,
		setSelectedLength
	};
};

const loadFileDialog = (intervals: readonly Interval[]) => {
	const savePath = remote.dialog.showSaveDialogSync({
		title: 'Save workout as MRC',
		filters: [{ name: 'MRC', extensions: ['mrc'] }]
	});

	if (savePath) {
		fs.writeFileSync(
			savePath,
			buildMRCFileString(
				'Workout',
				'',
				intervals.map(i => ({ durationSeconds: i.length, intensityPercent: i.intensity * 100 }))
			)
		);
	}
};

const IntervalAdjustmentFormGroup = () => {
	const {
		intervals,
		selectedIndex,
		currentSelectedInterval,
		undoEnabled,
		redoEnabled,
		newInterval
	} = useWorkoutCreatorSelector(w => ({
		intervals: intervalsWithColor(w),
		selectedIndex: w.selectedIndex,
		undoEnabled: canUndo(w),
		redoEnabled: canRedo(w),
		newInterval: w.newInterval,
		currentSelectedInterval: selectedOrNewInterval(w)
	}));

	const { setIntervals, undo, redo, setSelectedIntensity, setSelectedLength } = useActions();

	const saveToMRC = useCallback(() => loadFileDialog(intervals), [intervals]);

	const setIntervalDuration = useCallback(
		(m: moment.Moment | null) => {
			const seconds = m?.unix() ?? 0;
			setSelectedLength(seconds);
		},
		[setSelectedLength]
	);

	const addInterval = useCallback(() => {
		if (newInterval.length > 0) {
			setIntervals([...intervals, newInterval]);
		}
	}, [newInterval, setIntervals, intervals]);

	const deleteSelected = useCallback(() => {
		if (selectedIndex != null) {
			const copy = intervals.slice();
			copy.splice(selectedIndex, 1);
			setIntervals(copy);
		}
	}, [intervals, selectedIndex, setIntervals]);

	const formControlClasses = useStyles();

	return (
		<FormGroup row>
			<IconButton aria-label="save to MRC" onClick={saveToMRC}>
				<Save />
			</IconButton>
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
						value={moment.utc(currentSelectedInterval.length * 1000)}
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
						value={currentSelectedInterval.intensity * 100}
						onChange={e => setSelectedIntensity(parseFloat(e.target.value) * 0.01)}
					/>
				}
				label="Intensity"
				labelPlacement="start"
			/>
			<IconButton
				aria-label="add"
				onClick={addInterval}
				disabled={newInterval.length === 0 || selectedIndex !== null}
			>
				<Add />
			</IconButton>
			<IconButton aria-label="delete" onClick={deleteSelected} disabled={selectedIndex === null}>
				<Delete />
			</IconButton>
		</FormGroup>
	);
};

export default IntervalAdjustmentFormGroup;
