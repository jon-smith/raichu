import * as React from 'react';
import { useWorkoutCreatorSelector } from '@/state/reducers';
import { useDispatchCallback } from '@/state/actions';
import * as WorkoutCreatorActions from '@/state/actions/workout-creator-actions';
import WorkoutCreatorChart from './workout-creator-chart';

const WorkoutCreatorPage = () => {
	const intervals = useWorkoutCreatorSelector(w => w.currentIntervals);
	const setIntervals = useDispatchCallback(WorkoutCreatorActions.setIntervals);

	return <WorkoutCreatorChart intervals={intervals} setIntervals={setIntervals} />;
};

export default WorkoutCreatorPage;
