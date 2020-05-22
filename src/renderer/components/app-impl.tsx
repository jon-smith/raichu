import * as React from 'react';
import { useMemo } from 'react';
import { useViewSelector } from 'state/reducers';
import { Page } from 'state/view/slice';
import NavigationTabs from './navigation-tabs';
import ActivityDataViewer from './activity-view/activity-data-viewer';
import WorkoutCreatorPanel from './workout-creator/workout-creator-panel';

import 'rc-time-picker/assets/index.css';
import './main.scss';

const getPage = (page: Page) => {
	switch (page) {
		case 'data':
			return ActivityDataViewer;
		case 'workout-creator':
			return WorkoutCreatorPanel;
		default:
			break;
	}

	return () => <div className="tab-panel" />;
};

const AppImpl = () => {
	const currentPage = useViewSelector(s => s.currentPage);
	const PageElement = useMemo(() => getPage(currentPage), [currentPage]);

	return (
		<div className="app">
			<div className="nav-tabs">
				<NavigationTabs />
			</div>
			<div className="tab-panel">
				<div className="main-panel">
					<PageElement />
				</div>
			</div>
		</div>
	);
};

export default AppImpl;
