import * as jolteon from 'jolteon';

describe('Native greeter', () => {
	it('Greets appropriately', () => {
		const greeting = jolteon.greet();
		expect(greeting).toEqual('hello 👋 node, 💙 frm Rust 🍄');
	});
});
