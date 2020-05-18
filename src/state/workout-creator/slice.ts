import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as ArrayUtils from 'shared/utils/array-utils';
import * as d3 from 'd3';
import { Mutable } from 'shared/utils/type-utils';
import { ActivityContainer } from 'shared/activity-data/activity-container';
import { Interval, WorkoutCreatorState, ActivityToIntervalParameters } from './types';
import {
	calculateActivityProcessedPowerTimeSeries,
	calculateMovingWindowDiscrepencyCurve,
	calculateDetectedSteps
} from './helpers';

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

const defaultState: WorkoutCreatorState = {
	ftp: 200,
	generationParams: {
		minIntervalDuration: 10,
		stepThreshold: 0.1,
		windowRadius: 10,
		discrepencySmoothingRadius: 1,
		inputSmoothingRadius: 1
	},
	generatingFromActivity: false,
	newInterval: { intensity: 1.0, length: 0 },
	currentIntervals: defaultIntervals,
	history: [defaultIntervals],
	currentHistoryPosition: 0,
	selectedIndex: null
};

export const generateIntervals = createAsyncThunk(
	'workoutCreator/generateIntervals',
	// Note this function doesn't actually run asynchronously at the moment
	// but I intend to use a worker thread in the future
	// For now I just wanted to try out the usage of createAsyncThunk
	async ({
		activity,
		ftp,
		params
	}: {
		activity: ActivityContainer;
		ftp: number;
		params: ActivityToIntervalParameters;
	}) => {
		const timeVsPower = calculateActivityProcessedPowerTimeSeries(activity, {
			interpolateNull: true,
			maxGapForInterpolation: 3,
			resolution: 1
		});

		// Convert to intensity using FTP, and replace nulls with 0
		const timeVsIntensity = timeVsPower.map(v => ({ t: v.x, i: v.y ? v.y / ftp : 0.0 }));
		const intensityPerSecond = timeVsIntensity.map(ti => ti.i);
		const smoothedIntensityPerSecond = ArrayUtils.movingAverage(
			intensityPerSecond,
			params.inputSmoothingRadius
		);

		const discrepencyCurve = calculateMovingWindowDiscrepencyCurve(
			smoothedIntensityPerSecond,
			params.windowRadius,
			params.discrepencySmoothingRadius
		);

		const stepTimePoints = calculateDetectedSteps(discrepencyCurve, params.stepThreshold);

		const result: Interval[] = [];

		for (let i = 1; i < stepTimePoints.length; ++i) {
			const startTime = stepTimePoints[i - 1];
			const endTime = stepTimePoints[i];
			const duration = endTime - startTime;
			const thisIntervalData = intensityPerSecond.slice(startTime, endTime);
			result.push({ length: duration, intensity: d3.mean(thisIntervalData) ?? 0 });
		}

		return result;
	}
);

function setIntervalsImpl(state: Mutable<WorkoutCreatorState>, intervals: Interval[]) {
	const areEqual = (a: Interval, b: Interval) =>
		a.intensity === b.intensity && a.length === b.length;
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
		}
	},
	extraReducers: builder => {
		builder.addCase(generateIntervals.pending, state => {
			state.generatingFromActivity = true;
		});
		builder.addCase(generateIntervals.rejected, state => {
			state.generatingFromActivity = false;
		});
		builder.addCase(generateIntervals.fulfilled, (state, { payload }) => {
			setIntervalsImpl(state, payload);
			state.generatingFromActivity = false;
		});
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
	setWindowRadius,
	setStepThreshold,
	setInputSmoothing,
	setDiscrepencySmoothing,
	setActivity,
	clearActivity
} = actions;
