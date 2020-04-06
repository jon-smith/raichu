import { combineReducers } from 'redux';
import { useSelector } from 'react-redux';

import { ActivityState, activityReducer } from './activityReducer';
import { ViewState, viewReducer } from './viewReducer';
import { workoutCreatorReducer, WorkoutCreatorState } from './workoutCreatorReducer';

export interface RootState {
	activities: ActivityState;
	view: ViewState;
	workoutCreator: WorkoutCreatorState;
}

export const rootReducer = combineReducers<RootState | undefined>({
	activities: activityReducer,
	view: viewReducer,
	workoutCreator: workoutCreatorReducer
});

export const useRootSelector = <T extends {}>(selector: (s: RootState) => T) =>
	useSelector<RootState, T>(s => selector(s));

export const useActivitySelector = <T extends {}>(selector: (s: ActivityState) => T) =>
	useSelector<RootState, T>(s => selector(s.activities));

export const useViewSelector = <T extends {}>(selector: (s: ViewState) => T) =>
	useSelector<RootState, T>(s => selector(s.view));

export const useWorkoutCreatorSelector = <T extends {}>(selector: (s: WorkoutCreatorState) => T) =>
	useSelector<RootState, T>(s => selector(s.workoutCreator));
