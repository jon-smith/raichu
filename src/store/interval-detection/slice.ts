import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
	IntervalDetectionParameters,
	performIntervalDetection,
} from 'library/activity-data/interval-detection';
import { ActivityContainer } from 'library/activity-data/activity-container';

type IntervalDetectionResults = ReturnType<typeof performIntervalDetection>;

export type IntervalDetectionState = Readonly<{
	generationParams: IntervalDetectionParameters;
	ftp: number;
	isGenerating: boolean;
	detectionResults: IntervalDetectionResults;
}>;

const defaultState: IntervalDetectionState = {
	ftp: 200,
	generationParams: {
		minIntervalDuration: 10,
		stepThreshold: 10,
		windowRadius: 10,
		discrepencySmoothingRadius: 1,
		inputSmoothingRadius: 1,
	},
	isGenerating: false,
	detectionResults: {
		intervals: [],
		rawInput: [],
		smoothedInput: [],
		discrepencyCurve: [],
		detectedStepTimePoints: [],
	},
};

export const generateIntervals = createAsyncThunk(
	'intervalDetection/generateIntervals',
	// Note this function doesn't actually run asynchronously at the moment
	// but I intend to use a worker thread in the future
	// For now I just wanted to try out the usage of createAsyncThunk
	async ({
		activity,
		params,
	}: {
		activity: ActivityContainer | undefined;
		params: IntervalDetectionParameters;
	}) => performIntervalDetection(activity, params)
);

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
	extraReducers: (builder) => {
		builder.addCase(generateIntervals.pending, (state) => {
			state.isGenerating = true;
		});
		builder.addCase(generateIntervals.rejected, (state) => {
			state.isGenerating = false;
		});
		builder.addCase(generateIntervals.fulfilled, (state, { payload }) => {
			state.detectionResults = payload;
			state.isGenerating = false;
		});
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
