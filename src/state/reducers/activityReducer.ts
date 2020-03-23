import { Reducer } from 'redux';

import { FileAndGpx } from '@renderer/components/gpx-file-drop';
import { ADD_GPX_FILE, CLEAR_ACTIVITY_DATA, ActivityAction } from '../actions/activityActions';

export interface ActivityState {
	readonly files: FileAndGpx[];
}

const defaultState: ActivityState = {
	files: []
};

export const activityReducer: Reducer<ActivityState> = (
	state = defaultState,
	action: ActivityAction
) => {
	switch (action.type) {
		case ADD_GPX_FILE:
			return {
				...state,
				files: [...state.files, ...action.data]
			};
		case CLEAR_ACTIVITY_DATA:
			return {
				...state,
				files: []
			};
		default:
			return state;
	}
};
