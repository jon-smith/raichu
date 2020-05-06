import * as React from 'react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { batchActions } from 'redux-batched-actions';

import Box from '@material-ui/core/Box';

import { useWorkoutCreatorSelector } from 'state/reducers';
import { useDispatchCallback } from 'state/dispatch-hooks';
import { Interval } from 'state/workout-creator/types';
import * as WorkoutCreatorActions from 'state/workout-creator/actions';
import { selectedOrNewInterval, intervalsWithColor } from 'state/workout-creator/selectors';

import WorkoutCreatorChart from './workout-creator-chart';
import ActivityLoader from './activity-loader';
import IntervalAdjustmentFormGroup from './interval-adjustment-form-group';

const useActions = () => {
	const setIntervals = useDispatchCallback(WorkoutCreatorActions.setIntervals);
	const setSelectedIntensity = useDispatchCallback(WorkoutCreatorActions.setSelectedIntensity);
	const setSelectedLength = useDispatchCallback(WorkoutCreatorActions.setSelectedLength);

	const dispatch = useDispatch();
	const onChange = useCallback(
		(newIntervals: Interval[], newIndex: number | null) => {
			// Batch the interval and index updates to prevent flicker on multiple rerender
			dispatch(
				batchActions([
					WorkoutCreatorActions.setIntervals(newIntervals),
					WorkoutCreatorActions.setSelectedIndex(newIndex)
				])
			);
		},
		[dispatch]
	);

	return {
		setIntervals,
		onChange,
		setSelectedIntensity,
		setSelectedLength
	};
};

const WorkoutCreatorPage = () => {
	const { intervals, selectedIndex, currentSelectedInterval } = useWorkoutCreatorSelector(w => ({
		intervals: intervalsWithColor(w),
		selectedIndex: w.selectedIndex,
		currentSelectedInterval: selectedOrNewInterval(w)
	}));

	const { onChange, setSelectedIntensity, setSelectedLength } = useActions();

	const onMouseWheel = useCallback(
		(e: React.WheelEvent) => {
			if (selectedIndex == null) return;
			const intensityChange = e.deltaY < 0 ? 0.01 : -0.01;
			const newIntensity = Math.max(
				0.01,
				currentSelectedInterval.intensity + intensityChange
			).toFixed(2);
			setSelectedIntensity(parseFloat(newIntensity));
		},
		[currentSelectedInterval, selectedIndex, setSelectedIntensity]
	);

	return (
		<div className="workout-creator-panel">
			<Box display="flex" flexDirection="column">
				<ActivityLoader />
				<IntervalAdjustmentFormGroup />
				<Box>
					<div className="workout-creator-chart" onWheel={onMouseWheel}>
						<WorkoutCreatorChart
							intervals={intervals}
							selectedIndex={selectedIndex}
							onChange={onChange}
						/>
					</div>
				</Box>
			</Box>
		</div>
	);
};

export default WorkoutCreatorPage;
