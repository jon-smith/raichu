import { createSelector } from '@reduxjs/toolkit';
import {
	calculateActivityPowerPerSecond,
	calculateActivityProcessedPowerTimeSeries,
	calculateMovingWindowDiscrepencyCurve,
	calculateDetectedSteps
} from './helpers';
import { Interval, WorkoutCreatorState } from './types';

const activitySelector = (state: WorkoutCreatorState) => state.activity;

export const getActivityPowerPerSecond = createSelector(
	activitySelector,
	calculateActivityPowerPerSecond
);

export const getActivityProcessedPowerTimeSeries = createSelector(
	activitySelector,
	calculateActivityProcessedPowerTimeSeries
);

export const getMovingWindowDiscrepencyCurve = createSelector(
	activitySelector,
	s => s.generationParams,
	s => s.ftp,
	(activity, params, ftp) => {
		const timeVsPower = calculateActivityProcessedPowerTimeSeries(activity, {
			interpolateNull: true,
			maxGapForInterpolation: 3,
			resolution: 1
		});

		// Convert to intensity using FTP, and replace nulls with 0
		const timeVsIntensity = timeVsPower.map(v => ({ t: v.x, i: v.y ? v.y / ftp : 0.0 }));

		return calculateMovingWindowDiscrepencyCurve(
			timeVsIntensity.map(ti => ti.i),
			params.windowRadius
		);
	}
);

export const getDetectedStepTimePoints = createSelector(
	getMovingWindowDiscrepencyCurve,
	s => s.generationParams.stepThreshold,
	calculateDetectedSteps
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
