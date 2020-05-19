import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';

export type BestSplitOptions = 'HR' | 'power' | 'pace';

export default function BestSplitCurveSelectionForm(props: {
	option: BestSplitOptions;
	onChange: (o: BestSplitOptions) => void;
}) {
	const { option, onChange } = props;

	const makeOnChange = (o: BestSplitOptions) => (e: unknown, c: boolean) => {
		if (c) onChange(o);
	};

	return (
		<FormControl component="fieldset">
			<RadioGroup row aria-label="position" name="position" defaultValue="HR">
				<FormControlLabel
					value="HR"
					control={<Radio color="primary" />}
					label="HR"
					labelPlacement="start"
					checked={option === 'HR'}
					onChange={makeOnChange('HR')}
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
					checked={option === 'pace'}
					onChange={makeOnChange('pace')}
				/>
			</RadioGroup>
		</FormControl>
	);
}
