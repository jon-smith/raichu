import { combineReducers } from 'redux';
import { useSelector } from 'react-redux';

import { ActivityState, activityReducer } from './activityReducer';

export interface RootState {
	activities: ActivityState;
}

export const rootReducer = combineReducers<RootState | undefined>({
	activities: activityReducer
});

export const useRootSelector = <T extends {}>(selector: (s: RootState) => T) =>
	useSelector<RootState, T>(s => selector(s));

export const useActivitySelector = <T extends {}>(selector: (s: ActivityState) => T) =>
	useSelector<RootState, T>(s => selector(s.activities));
