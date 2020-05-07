import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as ArrayUtils from 'shared/utils/array-utils';
import { GpxData } from 'shared/activity-data/gpxparsing';
import { Interval } from './types';
import { calculateActivityProcessedPowerTimeSeries } from './helpers';

interface MutableWorkoutCreatorState {
	activity?: GpxData;
	generatingFromActivity: boolean;
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

export const generateIntervals = createAsyncThunk(
	'workoutCreator/generateIntervals',
	async ({ activity, ftp }: { activity: GpxData; ftp: number }) => {
		const timeVsPower = calculateActivityProcessedPowerTimeSeries(activity, {
			interpolateNull: true,
			maxGapForInterpolation: 3,
			resolution: 1
		});
		// Convert to intensity using FTP, and replace nulls with 0
		const timeVsIntensity = timeVsPower.map(v => ({ t: v.x, i: v.y ? v.y / ftp : 0.0 }));
		const result: Interval[] = [];

		function makeBlankIntervalValues() {
			return {
				weight: 0.0,
				sum: 0.0,
				sumOfSquares: 0.0,
				timeRange: 0.0
			};
		}

		let currentInterval = makeBlankIntervalValues();

		function updateCurrent(duration: number, intensity: number) {
			return {
				weight: currentInterval.weight + duration,
				sum: currentInterval.sum + intensity * duration,
				sumOfSquares: currentInterval.sumOfSquares + intensity * intensity * duration,
				timeRange: currentInterval.timeRange + duration
			};
		}

		const minIntervalLength = 30;

		for (let i = 0; i < timeVsIntensity.length - 1; ++i) {
			const duration = timeVsIntensity[i + 1].t - timeVsIntensity[i].t;
			const intensity = timeVsIntensity[i].i;
			if (currentInterval.timeRange < minIntervalLength) {
				currentInterval = updateCurrent(duration, intensity);
			} else {
				result.push({
					length: currentInterval.timeRange,
					intensity: currentInterval.sum / currentInterval.weight
				});
				currentInterval = makeBlankIntervalValues();
			}
		}

		return result;
	}
);

const defaultState: WorkoutCreatorState = {
	ftp: 200,
	generatingFromActivity: false,
	newInterval: { intensity: 1.0, length: 0 },
	currentIntervals: defaultIntervals,
	history: [defaultIntervals],
	currentHistoryPosition: 0,
	selectedIndex: null
};

function setIntervalsImpl(state: MutableWorkoutCreatorState, intervals: Interval[]) {
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
		setActivity(state, action: PayloadAction<GpxData>) {
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
	setActivity,
	clearActivity
} = actions;
