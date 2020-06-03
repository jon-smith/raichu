import path from 'path';

export type JolteanLibT = typeof import('jolteon-wasm');

export async function importJolteon() {
	const lib: JolteanLibT = await import(
		path.resolve(__dirname, '../../rust-wasm/pkg-node', 'jolteon')
	);
	lib.init();
	return lib;
}
