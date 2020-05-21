import * as React from 'react';
import { useMemo } from 'react';
import { useActivitySelector } from 'state/reducers';
import { getAttributes } from 'shared/activity-data/activity-container';
import ConnectedActivityFileDrop from './activity-view/connected-activity-file-drop';
import ActivitySummaryTable from './activity-summary-table';

const FilePanel = () => {
	const activities = useActivitySelector(s => s.activities);

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
			<ConnectedActivityFileDrop />
			<ActivitySummaryTable rows={tableRows} />
		</div>
	);
};

export default FilePanel;
