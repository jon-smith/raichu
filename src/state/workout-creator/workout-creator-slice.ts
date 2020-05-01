import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as ArrayUtils from 'shared/utils/array-utils';
import { GpxData } from 'shared/activity-data/gpxparsing';
import { fromGPXData } from 'shared/activity-data/activity-calculator';

export type Interval = {
	intensity: number;
	length: number;
};

interface MutableWorkoutCreatorState {
	activity?: GpxData;
	ftp: number;
	newInterval: Interval;
	currentIntervals: readonly Interval[];
	history: readonly Interval[][];
	currentHistoryPosition: number;
	selectedIndex: number | null;
}

export type WorkoutCreatorState = Readonly<MutableWorkoutCreatorState>;

const defaultIntervals: Interval[] = [
	{ intensity: 0.3, length: 60 },
	{ intensity: 0.4, length: 60 },
	{ intensity: 0.5, length: 60 },
	{ intensity: 0.6, length: 60 * 5 },
	...Array(13)
		.fill([
			{ intensity: 1.3, length: 30 },
			{ intensity: 0.6, length: 15 }
		])
		.flat(),
	{ intensity: 0.6, length: 60 * 5 }
];

const areEqual = (a: Interval, b: Interval) => a.intensity === b.intensity && a.length === b.length;

const defaultState: WorkoutCreatorState = {
	ftp: 200,
	newInterval: { intensity: 1.0, length: 0 },
	currentIntervals: defaultIntervals,
	history: [defaultIntervals],
	currentHistoryPosition: 0,
	selectedIndex: null
};

function setIntervalsImpl(state: MutableWorkoutCreatorState, intervals: Interval[]) {
	if (!ArrayUtils.areEqual(intervals, state.currentIntervals, areEqual)) {
		const newHistory = [...state.history.slice(0, state.currentHistoryPosition + 1), intervals];

		state.history = newHistory;
		state.currentHistoryPosition = newHistory.length - 1;
		state.currentIntervals = intervals;
	}
}

const workoutCreatorSlice = createSlice({
	name: 'workoutCreator',
	initialState: defaultState,
	reducers: {
		setIntervals(state, action: PayloadAction<Interval[]>) {
			setIntervalsImpl(state, action.payload);
		},
		undo(state) {
			if (state.currentHistoryPosition > 0) {
				state.currentIntervals = state.history[state.currentHistoryPosition - 1];
				state.currentHistoryPosition -= 1;
			}
		},
		redo(state) {
			if (state.currentHistoryPosition < state.history.length - 1) {
				state.currentIntervals = state.history[state.currentHistoryPosition + 1];
				state.currentHistoryPosition += 1;
			}
		},
		setSelectedIndex(state, action: PayloadAction<number | null>) {
			state.selectedIndex = action.payload;
		},
		setSelectedIntensity(state, action: PayloadAction<number>) {
			if (state.selectedIndex === null) {
				state.newInterval.intensity = action.payload;
			} else {
				const updatedIntervals = state.currentIntervals.slice();
				updatedIntervals[state.selectedIndex] = {
					...updatedIntervals[state.selectedIndex],
					intensity: action.payload
				};
				setIntervalsImpl(state, updatedIntervals);
			}
		},
		setSelectedLength(state, action: PayloadAction<number>) {
			if (state.selectedIndex === null) {
				state.newInterval.length = action.payload;
			} else {
				const updatedIntervals = state.currentIntervals.slice();
				updatedIntervals[state.selectedIndex] = {
					...updatedIntervals[state.selectedIndex],
					length: action.payload
				};
				setIntervalsImpl(state, updatedIntervals);
			}
		},
		setFTP(state, action: PayloadAction<number>) {
			state.ftp = action.payload;
		},
		setActivity(state, action: PayloadAction<GpxData>) {
			state.activity = action.payload;
		},
		clearActivity(state) {
			state.activity = undefined;
		}
	}
});

export const { reducer, actions } = workoutCreatorSlice;

export const {
	setIntervals,
	undo,
	redo,
	setSelectedIndex,
	setSelectedIntensity,
	setSelectedLength,
	setFTP,
	setActivity,
	clearActivity
} = actions;

export const canUndo = (state: WorkoutCreatorState) => state.currentHistoryPosition > 0;

export const canRedo = (state: WorkoutCreatorState) =>
	state.currentHistoryPosition < state.history.length - 1;

export const selectedInterval = (state: WorkoutCreatorState): Interval | null =>
	state.selectedIndex === null ? null : state.currentIntervals[state.selectedIndex];

export const selectedOrNewInterval = (state: WorkoutCreatorState): Interval =>
	selectedInterval(state) ?? state.newInterval;

const getColor = (i: Interval) => {
	const { intensity } = i;
	if (intensity < 0.6) return '#a6a6a6';
	if (intensity < 0.75) return '#9acfe3';
	if (intensity < 0.9) return '#77dd77';
	if (intensity < 1.05) return '#fdfd96';
	if (intensity < 1.18) return '#ffb347';
	return '#ff6961';
};

export type IntervalWithColor = Interval & { color: string };

export const intervalsWithColor = (state: WorkoutCreatorState) =>
	state.currentIntervals.map(i => ({ ...i, color: getColor(i) }));

export const getActivityPowerPerSecond = (state: WorkoutCreatorState) => {
	if (!state.activity) return [];

	const activityData = fromGPXData(state.activity);

	return activityData.filledPoints.map(p => p.data?.power ?? null);
};