import * as React from 'react';
import * as renderer from 'react-test-renderer';

import ActivitySummaryTable, { ActivityData } from '@renderer/components/activity-summary-table';

const testData: ActivityData[] = [
	{ filename: '1', name: 'one', date: new Date(2000, 1, 1) },
	{ filename: '2', name: 'two' }
];

describe('Counter component', () => {
	it('renders correctly', () => {
		const tree = renderer.create(<ActivitySummaryTable rows={testData} />).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
