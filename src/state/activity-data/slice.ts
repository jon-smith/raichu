import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { FileAndGpx } from 'ui/file/gpx-file-drop';

export type ActivityState = Readonly<{
	files: FileAndGpx[];
}>;

const defaultState: ActivityState = {
	files: []
};

const slice = createSlice({
	name: 'activityData',
	initialState: defaultState,
	reducers: {
		addGpxFiles(state, action: PayloadAction<FileAndGpx[]>) {
			state.files = [...state.files, ...action.payload];
		},
		clearActivityData(state) {
			state.files = [];
		}
	}
});

export const { reducer, actions } = slice;

export const { addGpxFiles, clearActivityData } = actions;
