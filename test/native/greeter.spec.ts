import * as jolteon from 'jolteon';

describe('Native greeter', () => {
	it('Greets appropriately', () => {
		const greeting = jolteon.greet();
		expect(greeting).toEqual('hello 👋 node, 💙 frm Rust 🍄');
	});

	it('Other funcs', () => {
		const result = jolteon.bestAveragesForDistances();
		expect(typeof result).toEqual('object');
	});
});
