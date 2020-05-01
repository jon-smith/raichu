import { combineReducers } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { ActivityState, reducer as activityReducer } from './activity-data/activity-data-slice';
import { ViewState, reducer as viewReducer } from './view/view-slice';
import {
	WorkoutCreatorState,
	reducer as workoutCreatorReducer
} from './workout-creator/workout-creator-slice';

export const rootReducer = combineReducers({
	activities: activityReducer,
	view: viewReducer,
	workoutCreator: workoutCreatorReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export const useRootSelector = <T extends {}>(selector: (s: RootState) => T) =>
	useSelector<RootState, T>(s => selector(s));

export const useActivitySelector = <T extends {}>(selector: (s: ActivityState) => T) =>
	useSelector<RootState, T>(s => selector(s.activities));

export const useViewSelector = <T extends {}>(selector: (s: ViewState) => T) =>
	useSelector<RootState, T>(s => selector(s.view));

export const useWorkoutCreatorSelector = <T extends {}>(selector: (s: WorkoutCreatorState) => T) =>
	useSelector<RootState, T>(s => selector(s.workoutCreator));
