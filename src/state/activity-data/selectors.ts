import { createSelector } from '@reduxjs/toolkit';
import { getAttributes } from 'shared/activity-data/activity-container';
import { ActivityState } from './slice';

export function getSelectedActivity(state: ActivityState) {
	return state.selectedIndex !== undefined ? state.activities[state.selectedIndex] : undefined;
}

export const getActivityAttributes = createSelector(
	(state: ActivityState) => state.activities,
	activities => activities.map(a => getAttributes(a))
);
