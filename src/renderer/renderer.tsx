import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Import the styles here to process them with webpack
import '@public/style.css';

import TestDataViewer from './components/test-data-viewer';

ReactDOM.render(
	<div className='app'>
		<h4>Welcome to raichu</h4>
		<p>頂きます</p>
		<TestDataViewer />
	</div>,
	document.getElementById('app')
);
