import { hot } from 'react-hot-loader/root';
import * as React from 'react';

import TestDataViewer from './test-data-viewer';
import FilePanel from './file-panel';

import './App.scss';

const Application = () => (
	<div className="app">
		<div className="left-panel">
			<div className="left-panel-inner">
				<h4>Welcome to raichu</h4>
				<p>頂きます</p>
				<FilePanel />
			</div>
		</div>
		<div className="main-panel">
			<div className="main-panel-inner">
				<TestDataViewer />
			</div>
		</div>
	</div>
);

export default hot(Application);
