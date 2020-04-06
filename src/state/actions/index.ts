import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { Action } from 'redux';
import { ActivityAction } from './activity-actions';
import { ViewAction } from './view-actions';
import { WorkoutCreatorAction } from './workout-creator-actions';

export type RootActions =
	| ActivityAction[keyof ActivityAction]
	| ViewAction[keyof ViewAction]
	| WorkoutCreatorAction[keyof WorkoutCreatorAction];

export const useDispatchCallback = <T, ActionT extends Action>(action: (t: T) => ActionT) => {
	const dispatch = useDispatch();
	const callback = useCallback(i => dispatch(action(i)), [dispatch, action]);
	return callback;
};
