import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActivityContainer } from 'shared/activity-data/activity-container';

type ExtendedActivityContainer = ActivityContainer & { filename: string };

export type ActivityState = Readonly<{
	activities: ExtendedActivityContainer[];
}>;

const defaultState: ActivityState = {
	activities: []
};

const slice = createSlice({
	name: 'activityData',
	initialState: defaultState,
	reducers: {
		addActivities(state, action: PayloadAction<ExtendedActivityContainer[]>) {
			state.activities = [...state.activities, ...action.payload];
		},
		clearActivityData(state) {
			state.activities = [];
		}
	}
});

export const { reducer, actions } = slice;

export const { addActivities, clearActivityData } = actions;
