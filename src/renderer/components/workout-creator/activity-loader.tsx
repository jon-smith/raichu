import * as React from 'react';
import { useCallback } from 'react';

import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import { Close } from '@material-ui/icons';

import GpxFileDrop, { FileAndGpx } from 'ui/file/gpx-file-drop';

import { useDispatchCallback } from 'state/dispatch-hooks';
import { setActivity, clearActivity } from 'state/workout-creator/workout-creator-slice';
import { useWorkoutCreatorSelector } from 'state/reducers';

const ActivityLoader = () => {
	const loadedActivity = useWorkoutCreatorSelector(s => s.activity);

	const setActivityDispatcher = useDispatchCallback(setActivity);
	const clearActivitityDispatcher = useDispatchCallback(clearActivity);

	const addFiles = useCallback(
		(files: FileAndGpx[]) => {
			if (files.length > 0) {
				const { gpx } = files[0];
				setActivityDispatcher(gpx);
			}
		},
		[setActivityDispatcher]
	);

	return (
		<Box display="flex" flexDirection="row" alignItems="center" margin="10px" minHeight="2em">
			{loadedActivity ? (
				<>
					<span>{`Loaded activity: ${loadedActivity.track.name}`}</span>
					<IconButton aria-label="close file" onClick={() => clearActivitityDispatcher()}>
						<Close />
					</IconButton>
				</>
			) : (
				<GpxFileDrop onAddFiles={addFiles} allowMultiple={false} />
			)}
		</Box>
	);
};

export default ActivityLoader;
