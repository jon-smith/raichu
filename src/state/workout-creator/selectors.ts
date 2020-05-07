import { createSelector } from '@reduxjs/toolkit';
import {
	calculateActivityPowerPerSecond,
	calculateActivityProcessedPowerTimeSeries
} from './helpers';
import { WorkoutCreatorState } from './slice';
import { Interval } from './types';

const activitySelector = (state: WorkoutCreatorState) => state.activity;

export const getActivityPowerPerSecond = createSelector(
	activitySelector,
	calculateActivityPowerPerSecond
);

export const getActivityProcessedPowerTimeSeries = createSelector(
	activitySelector,
	calculateActivityProcessedPowerTimeSeries
);

const getColor = (i: Interval) => {
	const { intensity } = i;
	if (intensity < 0.6) return '#a6a6a6';
	if (intensity < 0.75) return '#9acfe3';
	if (intensity < 0.9) return '#77dd77';
	if (intensity < 1.05) return '#fdfd96';
	if (intensity < 1.18) return '#ffb347';
	return '#ff6961';
};

export const intervalsWithColor = createSelector(
	(state: WorkoutCreatorState) => state.currentIntervals,
	intervals => intervals.map(i => ({ ...i, color: getColor(i) }))
);

export const canUndo = (state: WorkoutCreatorState) => state.currentHistoryPosition > 0;

export const canRedo = (state: WorkoutCreatorState) =>
	state.currentHistoryPosition < state.history.length - 1;

export const selectedInterval = (state: WorkoutCreatorState): Interval | null =>
	state.selectedIndex === null ? null : state.currentIntervals[state.selectedIndex];

export const selectedOrNewInterval = (state: WorkoutCreatorState): Interval =>
	selectedInterval(state) ?? state.newInterval;
