import React from 'react';

import { useActivitySelector } from 'state/reducers';

import BestSplitPlotViewer from './best-split-plot';
import ActivitySelectionForm from './activity-selection-form';
import TimeSeriesDataViewer from './time-series-data-viewer';
import ConnectedActivityFileDrop from './connected-activity-file-drop';

const ActivityDataViewer = () => {
	const activitiesLoaded = useActivitySelector(s => s.activities.length > 0);

	if (!activitiesLoaded) {
		return (
			<div className="activity-data-welcome">
				<h4>Welcome to raichu</h4>
				<p>頂きます</p>
				<ConnectedActivityFileDrop text="To get started, drop GPX/TCX files here, or click to use the file browser" />
			</div>
		);
	}

	return (
		<div className="activity-data-viewer">
			<ActivitySelectionForm />
			<TimeSeriesDataViewer />
			<BestSplitPlotViewer />
		</div>
	);
};

export default ActivityDataViewer;
