import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IntervalDetectionParameters } from 'library/activity-data/interval-detection';

export type IntervalDetectionState = Readonly<{
	generationParams: IntervalDetectionParameters;
	ftp: number;
}>;

const defaultState: IntervalDetectionState = {
	ftp: 200,
	generationParams: {
		minIntervalDuration: 10,
		stepThreshold: 0.1,
		windowRadius: 10,
		discrepencySmoothingRadius: 1,
		inputSmoothingRadius: 1,
	},
};

const intervalDetectionSlice = createSlice({
	name: 'intervalDetection',
	initialState: defaultState,
	reducers: {
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
	},
});

export const { reducer, actions } = intervalDetectionSlice;

export const {
	setFTP,
	setWindowRadius,
	setStepThreshold,
	setInputSmoothing,
	setDiscrepencySmoothing,
} = actions;
