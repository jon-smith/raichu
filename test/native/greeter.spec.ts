import * as jolteon from 'jolteon';

describe('Native greeter', () => {
	it('Greets appropriately', () => {
		const greeting = jolteon.greet();
		expect(greeting).toEqual('hello 👋 node, 💙 frm Rust 🍄');
	});

	it('Other funcs', () => {
		const result = jolteon.bestAveragesForDistances([1, 2, null, 3], [1]);
		expect(typeof result).toEqual('object');
		expect(Array.isArray(result)).toBe(true);
	});
});
