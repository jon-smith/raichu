import * as React from 'react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useViewSelector } from 'state/reducers';
import { Page, setCurrentPage } from 'state/view/view-slice';

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

const pageOrder: Page[] = ['data', 'workout-creator'];
const pageToIndex = (p: Page) => pageOrder.findIndex(o => o === p) ?? 0;

const NavigationTabs = () => {
	const currentPage = useViewSelector(s => s.currentPage);

	const dispatch = useDispatch();

	const setCurrentPageCallback = useCallback(
		(_: React.ChangeEvent<{}>, newValue: number) => {
			dispatch(setCurrentPage(pageOrder[newValue]));
		},
		[dispatch]
	);

	return (
		<StyledTabs value={pageToIndex(currentPage)} onChange={setCurrentPageCallback}>
			<StyledTab label="Data" />
			<StyledTab label="Workout Creator" />
		</StyledTabs>
	);
};

export default NavigationTabs;
