import * as React from 'react';
import { useState, useCallback } from 'react';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const StyledTabs = withStyles((theme: Theme) => ({
	root: {
		borderBottom: '1px solid #e8e8e8',
		width: '100%',
		backgroundColor: theme.palette.background.paper
	},
	indicator: {
		backgroundColor: '#1890ff'
	}
}))(Tabs);

interface StyledTabProps {
	label: string;
}

const StyledTab = withStyles((theme: Theme) =>
	createStyles({
		root: {
			textTransform: 'none',
			minWidth: 72,
			fontWeight: theme.typography.fontWeightRegular,
			marginRight: theme.spacing(4),
			'&:hover': {
				color: '#40a9ff',
				opacity: 1
			},
			'&$selected': {
				color: '#1890ff',
				fontWeight: theme.typography.fontWeightMedium
			},
			'&:focus': {
				color: '#40a9ff'
			}
		},
		selected: {}
	})
)((props: StyledTabProps) => <Tab disableRipple {...props} />);

const NavigationTabs = () => {
	const [selectedTab, setSelectedTab] = useState(0);

	const handleChange = useCallback((_: React.ChangeEvent<{}>, newValue: number) => {
		setSelectedTab(newValue);
	}, []);

	return (
		<StyledTabs value={selectedTab} onChange={handleChange} aria-label="ant example">
			<StyledTab label="Data" />
			<StyledTab label="Workout Creator" />
		</StyledTabs>
	);
};

export default NavigationTabs;
