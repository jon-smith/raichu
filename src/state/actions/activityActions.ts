import { Action, ActionCreator } from 'redux';

import { FileAndGpx } from '@renderer/components/gpx-file-drop';

export const ADD_GPX_FILE = 'ADD_GPX_FILE';
export const CLEAR_ACTIVITY_DATA = 'CLEAR_ACTIVITY_DATA';

export interface AddGpxFileAction extends Action {
	type: 'ADD_GPX_FILE';
	data: FileAndGpx[];
}

export interface ClearActivityDataAction extends Action {
	type: 'CLEAR_ACTIVITY_DATA';
}

export const addGpxFiles: ActionCreator<AddGpxFileAction> = (data: FileAndGpx[]) => ({
	type: ADD_GPX_FILE,
	data
});

export const clearActivityData: ActionCreator<ClearActivityDataAction> = () => ({
	type: CLEAR_ACTIVITY_DATA
});

export type ActivityAction = AddGpxFileAction | ClearActivityDataAction;
