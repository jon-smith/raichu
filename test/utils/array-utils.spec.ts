import * as ArrayUtils from 'shared/utils/array-utils';

describe('peakAndTrough', () => {
	test('flat', () => {
		const input = [1, 1, 1, 1, 1];
		const result = ArrayUtils.findPeaksAndTroughs(input);
		expect(result).toEqual([null, null, null, null, null]);
	});

	test('startHigh', () => {
		const input = [5, 5, 4, 3, 2, 3];
		const result = ArrayUtils.findPeaksAndTroughs(input);
		expect(result).toEqual(['peak', null, null, null, 'trough', null]);
	});

	test('startLow', () => {
		const input = [2, 2, 3, 4, 3, 4];
		const result = ArrayUtils.findPeaksAndTroughs(input);
		expect(result).toEqual(['trough', null, null, 'peak', 'trough', null]);
	});

	test('stepIncreases', () => {
		const input = [1, 1, 2, 2, 3, 3, 2, 1];
		const result = ArrayUtils.findPeaksAndTroughs(input);
		expect(result).toEqual(['trough', null, null, null, null, 'peak', null, null]);
	});
});
