import { JolteanLibT, importJolteon } from './helper';

import { calculateMaxAveragesForDistances } from 'library/activity-data/best-split-calculator';

describe('best-split-tests', () => {
	let wasm: JolteanLibT;

	beforeAll(async () => {
		wasm = await importJolteon();
	});

	test('vs native', () => {
		const input = [1, 1, 5, 5, 1, 1, 5, 5];
		const distances = [1, 2, 3, 4, 5, 6];

		const result = calculateMaxAveragesForDistances(input, distances);
		const nativeResult = wasm.best_averages_for_distances(
			new Float64Array(input),
			new Uint32Array(distances)
		);

		expect(result).toEqual(nativeResult);
	});
});
