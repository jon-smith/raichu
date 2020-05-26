import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as ArrayUtils from 'library/utils/array-utils';
import { Mutable } from 'library/utils/type-utils';
import { ActivityContainer } from 'library/activity-data/activity-container';
import { Interval } from 'library/activity-data/interval';
import { WorkoutCreatorState } from './types';
import { getDetectedIntervals } from './selectors';

const defaultIntervals: Interval[] = [
	{ intensityPercent: 0.3, durationSeconds: 60 },
	{ intensityPercent: 0.4, durationSeconds: 60 },
	{ intensityPercent: 0.5, durationSeconds: 60 },
	{ intensityPercent: 0.6, durationSeconds: 60 * 5 },
	...Array(13)
		.fill([
			{ intensityPercent: 1.3, durationSeconds: 30 },
			{ intensityPercent: 0.6, durationSeconds: 15 },
		])
		.flat(),
	{ intensityPercent: 0.6, durationSeconds: 60 * 5 },
];

const defaultState: WorkoutCreatorState = {
	ftp: 200,
	generationParams: {
		minIntervalDuration: 10,
		stepThreshold: 0.1,
		windowRadius: 10,
		discrepencySmoothingRadius: 1,
		inputSmoothingRadius: 1,
	},
	generatingFromActivity: false,
	newInterval: { intensityPercent: 1.0, durationSeconds: 0 },
	currentIntervals: defaultIntervals,
	history: [defaultIntervals],
	currentHistoryPosition: 0,
	selectedIndex: null,
};

export const generateIntervals = createAsyncThunk(
	'workoutCreator/generateIntervals',
	// Note this function doesn't actually run asynchronously at the moment
	// but I intend to use a worker thread in the future
	// For now I just wanted to try out the usage of createAsyncThunk
	async (state: WorkoutCreatorState) => {
		return getDetectedIntervals(state).intervals;
	}
);

function setIntervalsImpl(state: Mutable<WorkoutCreatorState>, intervals: Interval[]) {
	const areEqual = (a: Interval, b: Interval) =>
		a.intensityPercent === b.intensityPercent && a.durationSeconds === b.durationSeconds;
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
				state.newInterval.intensityPercent = action.payload;
			} else {
				const updatedIntervals = state.currentIntervals.slice();
				updatedIntervals[state.selectedIndex] = {
					...updatedIntervals[state.selectedIndex],
					intensityPercent: action.payload,
				};
				setIntervalsImpl(state, updatedIntervals);
			}
		},
		setSelectedLength(state, action: PayloadAction<number>) {
			if (state.selectedIndex === null) {
				state.newInterval.durationSeconds = action.payload;
			} else {
				const updatedIntervals = state.currentIntervals.slice();
				updatedIntervals[state.selectedIndex] = {
					...updatedIntervals[state.selectedIndex],
					durationSeconds: action.payload,
				};
				setIntervalsImpl(state, updatedIntervals);
			}
		},
		setFTP(state, action: PayloadAction<number>) {
			state.ftp = action.payload;
		},
		setWindowRadius(state, action: PayloadAction<number>) {
			state.generationParams.windowRadius = action.payload;
		},
		setStepThreshold(state, action: PayloadAction<number>) {
			state.generationParams.stepThreshold = action.payload;
		},
		setInputSmoothing(state, action: PayloadAction<number>) {
			state.generationParams.inputSmoothingRadius = action.payload;
		},
		setDiscrepencySmoothing(state, action: PayloadAction<number>) {
			state.generationParams.discrepencySmoothingRadius = action.payload;
		},
		setActivity(state, action: PayloadAction<ActivityContainer>) {
			state.activity = action.payload;
		},
		clearActivity(state) {
			state.activity = undefined;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(generateIntervals.pending, (state) => {
			state.generatingFromActivity = true;
		});
		builder.addCase(generateIntervals.rejected, (state) => {
			state.generatingFromActivity = false;
		});
		builder.addCase(generateIntervals.fulfilled, (state, { payload }) => {
			setIntervalsImpl(state, payload);
			state.generatingFromActivity = false;
		});
	},
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
	setWindowRadius,
	setStepThreshold,
	setInputSmoothing,
	setDiscrepencySmoothing,
	setActivity,
	clearActivity,
} = actions;
