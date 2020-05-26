import React from 'react';

import { useActivitySelector } from 'store/reducers';
import { View } from 'store/activity-data/slice';

import BestSplitPlotViewer from './best-split-plot';
import ActivitySelectionForm from './activity-selection-form';
import TimeSeriesDataViewer from './time-series-data-viewer';
import ConnectedActivityFileDrop from './connected-activity-file-drop';
import ActivityViewSelection from './activity-view-selection';
import IntervalDetectionView from './interval-detection-view';

function componentFromView(view: View) {
	switch (view) {
		case 'data':
			return (
				<>
					<TimeSeriesDataViewer />
					<BestSplitPlotViewer />
				</>
			);
		case 'interval-detector':
			return <IntervalDetectionView />;
		default:
			return <div />;
	}
}

const ActivityDataViewer = () => {
	const { activitiesLoaded, view } = useActivitySelector((s) => ({
		activitiesLoaded: s.activities.length > 0,
		view: s.view,
	}));

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
			<ActivityViewSelection />
			{componentFromView(view)}
		</div>
	);
};

export default ActivityDataViewer;
