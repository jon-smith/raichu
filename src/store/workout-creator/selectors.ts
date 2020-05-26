import { createSelector } from '@reduxjs/toolkit';
import { Interval } from 'library/activity-data/interval';
import { performIntervalDetection } from 'library/activity-data/interval-detection';
import { WorkoutCreatorState } from './types';

const activitySelector = (state: WorkoutCreatorState) => state.activity;

export const getDetectedIntervals = createSelector(
	activitySelector,
	(s) => s.ftp,
	(s) => s.generationParams,
	performIntervalDetection
);

export const canUndo = (state: WorkoutCreatorState) => state.currentHistoryPosition > 0;

export const canRedo = (state: WorkoutCreatorState) =>
	state.currentHistoryPosition < state.history.length - 1;

export const selectedInterval = (state: WorkoutCreatorState): Interval | null =>
	state.selectedIndex === null ? null : state.currentIntervals[state.selectedIndex];

export const selectedOrNewInterval = (state: WorkoutCreatorState): Interval =>
	selectedInterval(state) ?? state.newInterval;
