import React, { useMemo } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { useFormStyles } from 'renderer/styles/form-styles';

import { useActivitySelector } from 'state/reducers';
import { getActivityAttributes } from 'state/activity-data/selectors';
import { setSelectedIndex } from 'state/activity-data/slice';
import { useDispatchCallback } from 'state/dispatch-hooks';

export default function SimpleSelect() {
	const classes = useFormStyles();

	const { activities, selectedIndex } = useActivitySelector(s => ({
		activities: getActivityAttributes(s),
		selectedIndex: s.selectedIndex
	}));

	const setSelectedActivityIndex = useDispatchCallback(setSelectedIndex);

	const menuItems = useMemo(
		() =>
			activities.map((a, i) => (
				<MenuItem key={i} value={i}>
					{a.name}
				</MenuItem>
			)),
		[activities]
	);

	return (
		<div>
			<FormControl className={classes.formControl}>
				<InputLabel id="activity-select-label">Activity</InputLabel>
				<Select
					labelId="activity-select-label"
					id="activity-select"
					value={selectedIndex ?? ''}
					onChange={e => {
						const value = parseInt(String(e.target.value), 10);
						if (Number.isSafeInteger(value)) {
							setSelectedActivityIndex(value);
						}
					}}
				>
					{menuItems}
				</Select>
			</FormControl>
		</div>
	);
}
