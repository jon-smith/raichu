import path from 'path';

export type JolteanLibT = typeof import('jolteon-wasm');

export async function importJolteon(): Promise<JolteanLibT> {
	return await import(path.resolve(__dirname, '../../rust-wasm/pkg-node', 'jolteon'));
}
