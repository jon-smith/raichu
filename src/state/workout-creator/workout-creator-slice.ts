import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as ArrayUtils from 'shared/utils/array-utils';

export type Interval = {
	intensity: number;
	length: number;
};

export interface WorkoutCreatorState {
	readonly currentIntervals: readonly Interval[];
	readonly history: readonly Interval[][];
	readonly currentHistoryPosition: number;
	readonly selectedIndex: number | null;
}

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
	currentIntervals: defaultIntervals,
	history: [defaultIntervals],
	currentHistoryPosition: 0,
	selectedIndex: null
};

const workoutCreatorSlice = createSlice({
	name: 'workoutCreator',
	initialState: defaultState,
	reducers: {
		setIntervals(state, action: PayloadAction<Interval[]>) {
			if (ArrayUtils.areEqual(action.payload, state.currentIntervals, areEqual)) return state;
			const newHistory = [
				...state.history.slice(0, state.currentHistoryPosition + 1),
				action.payload
			];
			return {
				...state,
				history: newHistory,
				currentHistoryPosition: newHistory.length - 1,
				currentIntervals: action.payload
			};
		},
		undo(state) {
			return state.currentHistoryPosition <= 0
				? state
				: {
						...state,
						currentHistoryPosition: state.currentHistoryPosition - 1,
						currentIntervals: state.history[state.currentHistoryPosition - 1]
				  };
		},
		redo(state) {
			return state.currentHistoryPosition >= state.history.length - 1
				? state
				: {
						...state,
						currentHistoryPosition: state.currentHistoryPosition + 1,
						currentIntervals: state.history[state.currentHistoryPosition + 1]
				  };
		},
		setSelectedIndex(state, action: PayloadAction<number | null>) {
			return {
				...state,
				selectedIndex: action.payload
			};
		}
	}
});

export const { reducer, actions } = workoutCreatorSlice;

export const { setIntervals, undo, redo, setSelectedIndex } = actions;

export const canUndo = (state: WorkoutCreatorState) => state.currentHistoryPosition > 0;

export const canRedo = (state: WorkoutCreatorState) =>
	state.currentHistoryPosition < state.history.length - 1;

export const selectedInterval = (state: WorkoutCreatorState): Interval | null =>
	state.selectedIndex === null ? null : state.currentIntervals[state.selectedIndex];

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
