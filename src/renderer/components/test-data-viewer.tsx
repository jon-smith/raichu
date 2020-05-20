import React from 'react';

import BestSplitPlotViewer from './activity-view/best-split-plot';
import ActivitySelectionForm from './activity-view/activity-selection-form';
import TimeSeriesDataViewer from './activity-view/time-series-data-viewer';

const TestDataViewer = () => {
	return (
		<div className="test-data-viewer">
			<ActivitySelectionForm />
			<TimeSeriesDataViewer />
			<BestSplitPlotViewer />
		</div>
	);
};

export default TestDataViewer;
