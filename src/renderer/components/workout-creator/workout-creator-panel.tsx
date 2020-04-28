import * as React from 'react';
import { useState, useCallback } from 'react';
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

import { useWorkoutCreatorSelector } from '@/state/reducers';
import { useDispatchCallback } from '@/state/actions';
import * as WorkoutCreatorActions from '@/state/actions/workout-creator-actions';
import {
	canUndo,
	canRedo,
	selectedInterval,
	intervalsWithColor
} from '@/state/reducers/workout-creator-reducer';
import { Interval } from '@/state/actions/workout-creator-actions';

import { buildMRCFileString } from '@/shared/activity-data/export-mrc';

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

const useActions = () => {
	const setIntervals = useDispatchCallback(WorkoutCreatorActions.setIntervals);
	const undo = useDispatchCallback(WorkoutCreatorActions.undo);
	const redo = useDispatchCallback(WorkoutCreatorActions.redo);

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

	return {
		setIntervals,
		undo,
		redo,
		onChange
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

const WorkoutCreatorPage = () => {
	const {
		intervals,
		selectedIndex,
		currentSelectedInterval,
		undoEnabled,
		redoEnabled
	} = useWorkoutCreatorSelector(w => ({
		intervals: intervalsWithColor(w),
		selectedIndex: w.selectedIndex,
		currentSelectedInterval: selectedInterval(w),
		undoEnabled: canUndo(w),
		redoEnabled: canRedo(w)
	}));

	const { setIntervals, undo, redo, onChange } = useActions();

	const saveToMRC = useCallback(() => loadFileDialog(intervals), [intervals]);

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

	const onMouseWheel = useCallback(
		(e: React.WheelEvent) => {
			if (selectedIndex == null) return;
			const intensityChange = e.deltaY < 0 ? 0.01 : -0.01;
			const newIntensity = Math.max(0.01, intervalIntensity + intensityChange).toFixed(2);
			setIntervalIntensity(parseFloat(newIntensity));
		},
		[intervalIntensity, selectedIndex, setIntervalIntensity]
	);

	const addInterval = useCallback(() => {
		if (newIntervalDuration > 0) {
			setIntervals([
				...intervals,
				{ intensity: newIntervalIntensity, length: newIntervalDuration }
			]);
		}
	}, [newIntervalDuration, setIntervals, intervals, newIntervalIntensity]);

	const deleteSelected = useCallback(() => {
		if (selectedIndex != null) {
			const copy = intervals.slice();
			copy.splice(selectedIndex, 1);
			setIntervals(copy);
		}
	}, [intervals, selectedIndex, setIntervals]);

	const formControlClasses = useStyles();

	return (
		<div className="workout-creator-panel">
			<Box display="flex" flexDirection="column">
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
					<IconButton
						aria-label="delete"
						onClick={deleteSelected}
						disabled={selectedIndex === null}
					>
						<Delete />
					</IconButton>
				</FormGroup>
				<Box>
					<div className="workout-creator-chart" onWheel={onMouseWheel}>
						<WorkoutCreatorChart
							intervals={intervals}
							selectedIndex={selectedIndex}
							onChange={onChange}
						/>
					</div>
				</Box>
			</Box>
		</div>
	);
};

export default WorkoutCreatorPage;
