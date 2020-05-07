import * as React from 'react';
import { useMemo } from 'react';
import { useDispatchCallback } from 'state/dispatch-hooks';
import { addGpxFiles } from 'state/activity-data/slice';
import { useActivitySelector } from 'state/reducers';
import GpxFileDrop from 'ui/file/gpx-file-drop';
import ActivitySummaryTable from './activity-summary-table';

const FilePanel = () => {
	const loadedFiles = useActivitySelector(s => s.files);

	const addFiles = useDispatchCallback(addGpxFiles);

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
			<GpxFileDrop onAddFiles={addFiles} />
			<ActivitySummaryTable rows={tableRows} />
		</div>
	);
};

export default FilePanel;
