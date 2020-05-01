import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { Action } from 'redux';

export const useDispatchCallback = <T extends unknown, ActionT extends Action>(
	action: (t: T) => ActionT
) => {
	const dispatch = useDispatch();
	const callback = useCallback((i: T) => dispatch(action(i)), [dispatch, action]);
	return callback;
};
