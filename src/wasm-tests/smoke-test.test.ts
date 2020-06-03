import path from 'path';

describe('wasm smoke test', () => {
	let wasm: typeof import('jolteon-wasm');

	beforeAll(async () => {
		wasm = await import(path.resolve(__dirname, '../../rust-wasm/pkg', 'jolteon.js'));
	});

	test('functions exist', () => {
		expect(wasm.init).toBeTruthy();
		expect(typeof wasm.init).toBe('function');

		expect(wasm.greet).toBeTruthy();
		expect(typeof wasm.greet).toBe('function');

		expect(wasm.best_averages_for_distances).toBeTruthy();
		expect(typeof wasm.best_averages_for_distances).toBe('function');
	});
});
