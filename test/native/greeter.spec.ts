import * as jolteon from 'jolteon';

describe('Native greeter', () => {
	it('Greets appropriately', () => {
		const greeting = jolteon.greet();
		expect(greeting).toEqual('hello 👋 node, 💙 frm Rust 🍄');
	});

	it('Other funcs', () => {
		const result = jolteon.best_averages_for_distances([3, 0, null, 3], [1, 2, 4]);
		expect(typeof result).toEqual('object');
		expect(Array.isArray(result)).toBe(true);
		expect(result[0]).toStrictEqual({ best: { startIndex: 0, average: 3 }, distance: 1 });
		expect(result[1]).toStrictEqual({ best: { startIndex: 0, average: 1.5 }, distance: 2 });
		expect(result[2]).toStrictEqual({ best: { startIndex: 0, average: 6 / 4 }, distance: 4 });
	});
});
