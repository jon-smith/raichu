import * as React from 'react';
import { useMemo, useCallback } from 'react';
import { useDispatchCallback } from 'state/dispatch-hooks';
import { addActivities } from 'state/activity-data/slice';
import { useActivitySelector } from 'state/reducers';
import ActivityFileDrop, { FileAndData, extractActivityData } from 'ui/file/activity-file-drop';
import { getAttributes } from 'shared/activity-data/activity-container';
import ActivitySummaryTable from './activity-summary-table';

const FilePanel = () => {
	const activities = useActivitySelector(s => s.activities);

	const addActivitesCallback = useDispatchCallback(addActivities);
	const addFiles = useCallback(
		(files: FileAndData[]) =>
			addActivitesCallback(
				files.flatMap(f => extractActivityData(f.data).map(a => ({ filename: f.file.name, ...a })))
			),
		[addActivitesCallback]
	);

	const tableRows = useMemo(
		() =>
			activities.map(l => ({
				filename: l.filename,
				name: getAttributes(l).name,
				date: getAttributes(l).date
			})),
		[activities]
	);

	return (
		<div className="file-panel">
			<ActivityFileDrop onAddFiles={addFiles} />
			<ActivitySummaryTable rows={tableRows} />
		</div>
	);
};

export default FilePanel;
