import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActivityContainer } from 'library/activity-data/activity-container';

type ExtendedActivityContainer = ActivityContainer & { filename: string };

export type View = 'data' | 'interval-detector';

export type ActivityState = Readonly<{
	activities: ExtendedActivityContainer[];
	selectedIndex?: number;
	view: View;
}>;

const defaultState: ActivityState = {
	activities: [],
	view: 'data',
};

const slice = createSlice({
	name: 'activityData',
	initialState: defaultState,
	reducers: {
		setView(state, action: PayloadAction<View>) {
			state.view = action.payload;
		},
		addActivities(state, action: PayloadAction<ExtendedActivityContainer[]>) {
			state.activities = [...state.activities, ...action.payload];
			// If we have any activities, but don't have a selection, select the first
			if (state.activities.length > 0 && state.selectedIndex === undefined) {
				state.selectedIndex = 0;
			}
		},
		clearActivityData(state) {
			state.activities = [];
		},
		setSelectedIndex(state, action: PayloadAction<number | undefined>) {
			state.selectedIndex = action.payload;
		},
	},
});

export const { reducer, actions } = slice;

export const { setView, addActivities, clearActivityData, setSelectedIndex } = actions;