import { hot } from 'react-hot-loader/root';
import * as React from 'react';
import { useMemo } from 'react';
import { Page } from '@/state/actions/view-actions';
import { useViewSelector } from '@/state/reducers';
import TestDataViewer from './test-data-viewer';
import FilePanel from './file-panel';
import NavigationTabs from './navigation-tabs';
import WorkoutCreatorPanel from './workout-creator/workout-creator-panel';
import './app.scss';

const MakePage = (LeftPanel: React.ComponentType, MainPanel: React.ComponentType) => (
	<div className="tab-panel">
		<div className="left-panel">
			<div className="left-panel-inner">
				<LeftPanel />
			</div>
		</div>
		<div className="main-panel">
			<MainPanel />
		</div>
	</div>
);

const DataPageLeftPanel = () => (
	<div>
		<h4>Welcome to raichu</h4>
		<p>頂きます</p>
		<FilePanel />
	</div>
);

const DataPage = () => MakePage(DataPageLeftPanel, TestDataViewer);
const WorkoutCreatorPage = () => MakePage(() => <div />, WorkoutCreatorPanel);

const getPage = (page: Page) => {
	switch (page) {
		case 'data':
			return DataPage;
		case 'workout-creator':
			return WorkoutCreatorPage;
		default:
			break;
	}

	return () => <div className="tab-panel" />;
};

const Application = () => {
	const currentPage = useViewSelector(s => s.currentPage);
	const PageElement = useMemo(() => getPage(currentPage), [currentPage]);

	return (
		<div className="app">
			<div className="nav-tabs">
				<NavigationTabs />
			</div>
			<PageElement />
		</div>
	);
};

export default hot(Application);
