import { createReducer, ActionType } from 'typesafe-actions';
import * as ArrayUtils from 'shared/utils/array-utils';
import { GpxData } from 'shared/activity-data/gpxparsing';
import { Interval } from './types';
import * as actions from './actions';

export type WorkoutCreatorState = Readonly<{
	activity?: GpxData;
	ftp: number;
	newInterval: Interval;
	currentIntervals: readonly Interval[];
	history: readonly Interval[][];
	currentHistoryPosition: number;
	selectedIndex: number | null;
}>;

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

type Action = ActionType<typeof actions>;

function setIntervalsImpl(state: WorkoutCreatorState, intervals: Interval[]) {
	if (ArrayUtils.areEqual(intervals, state.currentIntervals, areEqual)) return state;
	const newHistory = [...state.history.slice(0, state.currentHistoryPosition + 1), intervals];
	return {
		...state,
		history: newHistory,
		currentHistoryPosition: newHistory.length - 1,
		currentIntervals: intervals
	};
}

export const reducer = createReducer<WorkoutCreatorState, Action>(defaultState)
	.handleAction(actions.setIntervals, (state, action) => setIntervalsImpl(state, action.payload))
	.handleAction(actions.undo, state => {
		return state.currentHistoryPosition <= 0
			? state
			: {
					...state,
					currentHistoryPosition: state.currentHistoryPosition - 1,
					currentIntervals: state.history[state.currentHistoryPosition - 1]
			  };
	})
	.handleAction(actions.redo, state => {
		return state.currentHistoryPosition >= state.history.length - 1
			? state
			: {
					...state,
					currentHistoryPosition: state.currentHistoryPosition + 1,
					currentIntervals: state.history[state.currentHistoryPosition + 1]
			  };
	})
	.handleAction(actions.setSelectedIndex, (state, action) => {
		return {
			...state,
			selectedIndex: action.payload
		};
	})
	.handleAction(actions.setSelectedIntensity, (state, action) => {
		if (state.selectedIndex === null) {
			return {
				...state,
				newInterval: { ...state.newInterval, intensity: action.payload }
			};
		}

		const updatedIntervals = state.currentIntervals.slice();
		updatedIntervals[state.selectedIndex] = {
			...updatedIntervals[state.selectedIndex],
			intensity: action.payload
		};
		return setIntervalsImpl(state, updatedIntervals);
	})
	.handleAction(actions.setSelectedLength, (state, action) => {
		if (state.selectedIndex === null) {
			return {
				...state,
				newInterval: { ...state.newInterval, length: action.payload }
			};
		}

		const updatedIntervals = state.currentIntervals.slice();
		updatedIntervals[state.selectedIndex] = {
			...updatedIntervals[state.selectedIndex],
			length: action.payload
		};
		return setIntervalsImpl(state, updatedIntervals);
	})
	.handleAction(actions.setFTP, (state, action) => {
		return {
			...state,
			ftp: action.payload
		};
	})
	.handleAction(actions.setActivity, (state, action) => {
		return {
			...state,
			activity: action.payload
		};
	})
	.handleAction(actions.clearActivity, state => {
		return {
			...state,
			activity: undefined
		};
	});
