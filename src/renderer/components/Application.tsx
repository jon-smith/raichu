import { hot } from 'react-hot-loader/root';
import * as React from 'react';
import { useMemo } from 'react';
import { Page } from '@/state/actions/viewActions';
import { useViewSelector } from '@/state/reducers';
import TestDataViewer from './test-data-viewer';
import FilePanel from './file-panel';
import NavigationTabs from './navigation-tabs';
import WorkoutCreatorPanel from './workout-creator-panel';
import './app.scss';

const MakePage = (LeftPanel: React.ComponentType, MainPanel: React.ComponentType) => (
	<div className="tab-panel">
		<div className="left-panel">
			<LeftPanel />
		</div>
		<div className="main-panel">
			<MainPanel />
		</div>
	</div>
);

const DataPageLeftPanel = () => (
	<div className="left-panel-inner">
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
			return <DataPage />;
		case 'workout-creator':
			return <WorkoutCreatorPage />;
		default:
			break;
	}

	return <div className="tab-panel" />;
};

const Application = () => {
	const currentPage = useViewSelector(s => s.currentPage);
	const page = useMemo(() => getPage(currentPage), [currentPage]);

	return (
		<div className="app">
			<div className="nav-tabs">
				<NavigationTabs />
			</div>
			{page}
		</div>
	);
};

export default hot(Application);
