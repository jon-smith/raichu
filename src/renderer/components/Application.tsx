import { hot } from 'react-hot-loader/root';
import * as React from 'react';

import TestDataViewer from './test-data-viewer';

import './App.scss';

const Application = () => (
	<div className="app">
		<h4>Welcome to raichu</h4>
		<p>頂きます</p>
		<TestDataViewer />
	</div>
);

export default hot(Application);
