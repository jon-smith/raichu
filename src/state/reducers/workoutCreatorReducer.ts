import { Reducer } from 'redux';
import * as d3 from 'd3';

import {
	Interval,
	SET_INTERVALS,
	UNDO,
	REDO,
	WorkoutCreatorAction
} from '../actions/workoutCreatorActions';

export interface WorkoutCreatorState {
	readonly currentIntervals: Interval[];
	readonly history: Interval[][];
	readonly currentHistoryPosition: number;
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

const defaultState: WorkoutCreatorState = {
	currentIntervals: defaultIntervals,
	history: [defaultIntervals],
	currentHistoryPosition: 0
};

export const workoutCreatorReducer: Reducer<WorkoutCreatorState> = (
	state = defaultState,
	action: WorkoutCreatorAction
) => {
	switch (action.type) {
		case SET_INTERVALS: {
			const newHistory = [
				...state.history.slice(0, state.currentHistoryPosition),
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
		default:
			return state;
	}
};
