import { Variable, asRawVariable, BestSplitOption } from 'shared/activity-data/activity-calculator';

export function primaryColourForVariable(o: Variable) {
	switch (o) {
		case 'heartrate':
			return '#c23b22';
		case 'cadence':
			return '#ffb347';
		case 'power':
			return '#966fd6';
		default:
			return undefined;
	}
}

export function primaryColourForBestSplitOption(o: BestSplitOption) {
	const asVar = asRawVariable(o);
	if (asVar) return primaryColourForVariable(asVar);

	switch (o) {
		case 'speed':
			return '#779ecb';
		default:
			return undefined;
	}
}

export function axisLabelForVariable(o: Variable) {
	switch (o) {
		case 'heartrate':
			return 'HR';
		case 'cadence':
			return 'Cadence';
		case 'power':
			return 'Power (W)';
		default:
			return '';
	}
}
