import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { addGpxFiles } from '@state/actions/activityActions';
import { useActivitySelector } from '@state/reducers';
import GpxFileDrop, { FileAndGpx } from './gpx-file-drop';
import ActivitySummaryTable from './activity-summary-table';

const FilePanel = () => {
	const loadedFiles = useActivitySelector(s => s.files);

	const dispatch = useDispatch();
	const addFiles = useCallback((f: FileAndGpx[]) => dispatch(addGpxFiles(f)), []);

	const tableRows = useMemo(
		() =>
			loadedFiles.map(l => ({
				filename: l.file.name,
				name: l.gpx.track.name,
				date: l.gpx.metadata?.time
			})),
		[loadedFiles]
	);

	return (
		<div className="file-panel">
			<GpxFileDrop loadedFiles={loadedFiles} onAddFiles={addFiles} />
			<ActivitySummaryTable rows={tableRows} />
		</div>
	);
};

export default FilePanel;
