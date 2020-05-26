import React from 'react';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

import { useFormStyles } from 'components/styles/form-styles';

import { BestSplitOption } from 'library/activity-data/activity-calculator';

type Props = {
	option: BestSplitOption;
	onChange: (o: BestSplitOption) => void;
};

export default function BestSplitCurveSelectionForm(props: Props) {
	const styles = useFormStyles();

	const { option, onChange } = props;

	const makeOnChange = (o: BestSplitOption) => (e: unknown, c: boolean) => {
		if (c) onChange(o);
	};

	return (
		<FormControl className={styles.formControl} component="fieldset">
			<FormLabel component="legend">Best Splits</FormLabel>
			<RadioGroup row aria-label="position" name="position" defaultValue="HR">
				<FormControlLabel
					value="HR"
					control={<Radio color="primary" />}
					label="HR"
					labelPlacement="start"
					checked={option === 'heartrate'}
					onChange={makeOnChange('heartrate')}
				/>
				<FormControlLabel
					value="power"
					control={<Radio color="primary" />}
					label="Power"
					labelPlacement="start"
					checked={option === 'power'}
					onChange={makeOnChange('power')}
				/>
				<FormControlLabel
					value="pace"
					control={<Radio color="primary" />}
					label="Pace"
					labelPlacement="start"
					checked={option === 'speed'}
					onChange={makeOnChange('speed')}
				/>
			</RadioGroup>
		</FormControl>
	);
}
