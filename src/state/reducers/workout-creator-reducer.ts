import { Reducer } from 'redux';
import * as d3 from 'd3';
import * as ArrayUtils from '@/shared/utils/array-utils';

import {
	Interval,
	SET_INTERVALS,
	SET_SELECTED,
	UNDO,
	REDO,
	WorkoutCreatorAction
} from '../actions/workout-creator-actions';

export interface WorkoutCreatorState {
	readonly currentIntervals: readonly Interval[];
	readonly history: readonly Interval[][];
	readonly currentHistoryPosition: number;
	readonly selectedIndex: number | null;
}

const defaultIntervals: Interval[] = [
	{ intensity: 0.3, length: 60, color: d3.schemeBlues[5][0] },
	{ intensity: 0.4, length: 60, color: d3.schemeBlues[5][0] },
	{ intensity: 0.5, length: 60, color: d3.schemeBlues[5][0] },
	{ intensity: 0.6, length: 60 * 5, color: d3.schemeBlues[5][1] },
	...Array(13)
		.fill([
			{ intensity: 1.3, length: 30, color: d3.schemeBlues[5][3] },
			{ intensity: 0.6, length: 15, color: d3.schemeBlues[5][2] }
		])
		.flat(),
	{ intensity: 0.6, length: 60 * 5, color: d3.schemeBlues[5][1] }
];

const areEqual = (a: Interval, b: Interval) =>
	a.color === b.color && a.intensity === b.intensity && a.length === b.length;

const defaultState: WorkoutCreatorState = {
	currentIntervals: defaultIntervals,
	history: [defaultIntervals],
	currentHistoryPosition: 0,
	selectedIndex: null
};

export const workoutCreatorReducer: Reducer<WorkoutCreatorState> = (
	state = defaultState,
	action: WorkoutCreatorAction
) => {
	switch (action.type) {
		case SET_INTERVALS: {
			if (ArrayUtils.areEqual(action.intervals, state.currentIntervals, areEqual)) return state;
			const newHistory = [
				...state.history.slice(0, state.currentHistoryPosition + 1),
				action.intervals
			];
			return {
				...state,
				history: newHistory,
				currentHistoryPosition: newHistory.length - 1,
				currentIntervals: action.intervals
			};
		}
		case UNDO:
			return state.currentHistoryPosition <= 0
				? state
				: {
						...state,
						currentHistoryPosition: state.currentHistoryPosition - 1,
						currentIntervals: state.history[state.currentHistoryPosition - 1]
				  };
		case REDO:
			return state.currentHistoryPosition >= state.history.length - 1
				? state
				: {
						...state,
						currentHistoryPosition: state.currentHistoryPosition + 1,
						currentIntervals: state.history[state.currentHistoryPosition + 1]
				  };
		case SET_SELECTED:
			return {
				...state,
				selectedIndex: action.index
			};
		default:
			return state;
	}
};

export const canUndo = (state: WorkoutCreatorState) => state.currentHistoryPosition > 0;

export const canRedo = (state: WorkoutCreatorState) =>
	state.currentHistoryPosition < state.history.length - 1;

export const selectedInterval = (state: WorkoutCreatorState): Interval | null =>
	state.selectedIndex === null ? null : state.currentIntervals[state.selectedIndex];
