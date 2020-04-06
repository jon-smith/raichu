import * as React from 'react';

import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import { Undo, Redo } from '@material-ui/icons';

import { useWorkoutCreatorSelector } from '@/state/reducers';
import { useDispatchCallback } from '@/state/actions';
import * as WorkoutCreatorActions from '@/state/actions/workout-creator-actions';
import { canUndo, canRedo } from '@/state/reducers/workout-creator-reducer';
import WorkoutCreatorChart from './workout-creator-chart';

const WorkoutCreatorPage = () => {
	const { intervals, undoEnabled, redoEnabled } = useWorkoutCreatorSelector(w => ({
		intervals: w.currentIntervals,
		undoEnabled: canUndo(w),
		redoEnabled: canRedo(w)
	}));

	const setIntervals = useDispatchCallback(WorkoutCreatorActions.setIntervals);
	const undo = useDispatchCallback(WorkoutCreatorActions.undo);
	const redo = useDispatchCallback(WorkoutCreatorActions.redo);

	return (
		<Box display="flex" flexDirection="column">
			<Box display="flex" flexDirection="row">
				<IconButton aria-label="undo" disabled={!undoEnabled} onClick={undo}>
					<Undo />
				</IconButton>
				<IconButton aria-label="redo" disabled={!redoEnabled} onClick={redo}>
					<Redo />
				</IconButton>
			</Box>
			<Box>
				<WorkoutCreatorChart intervals={intervals} setIntervals={setIntervals} />
			</Box>
		</Box>
	);
};

export default WorkoutCreatorPage;
