import { createAction } from 'typesafe-actions';
import { GpxData } from 'shared/activity-data/gpxparsing';
import { Interval } from './types';

export const setIntervals = createAction('workoutCreator/setIntervals')<Interval[]>();
export const undo = createAction('workoutCreator/undo')();
export const redo = createAction('workoutCreator/redo')();
export const setSelectedIndex = createAction('workoutCreator/setSelectedIndex')<number | null>();
export const setSelectedIntensity = createAction('workoutCreator/setSelectedIntensity')<number>();
export const setSelectedLength = createAction('workoutCreator/setSelectedLength')<number>();
export const setFTP = createAction('workoutCreator/setFTP')<number>();
export const setActivity = createAction('workoutCreator/setActivity')<GpxData>();
export const clearActivity = createAction('workoutCreator/clearActivity')();
