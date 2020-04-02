import { combineReducers } from 'redux';
import { useSelector } from 'react-redux';

import { ActivityState, activityReducer } from './activityReducer';
import { ViewState, viewReducer } from './viewReducer';

export interface RootState {
	activities: ActivityState;
	view: ViewState;
}

export const rootReducer = combineReducers<RootState | undefined>({
	activities: activityReducer,
	view: viewReducer
});

export const useRootSelector = <T extends {}>(selector: (s: RootState) => T) =>
	useSelector<RootState, T>(s => selector(s));

export const useActivitySelector = <T extends {}>(selector: (s: ActivityState) => T) =>
	useSelector<RootState, T>(s => selector(s.activities));

export const useViewSelector = <T extends {}>(selector: (s: ViewState) => T) =>
	useSelector<RootState, T>(s => selector(s.view));
