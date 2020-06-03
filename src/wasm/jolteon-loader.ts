import path from 'path';

export type JolteanLibT = typeof import('jolteon-wasm');

async function loadJolteonUnsafe(): Promise<JolteanLibT> {
	const isTest = process.env.JEST_WORKER_ID !== undefined || typeof jest !== 'undefined';

	// If running test in jest we have to load the node version of the package
	if (isTest) return await import(path.resolve(__dirname, '../../rust-wasm/pkg-node', 'jolteon'));
	return await import('jolteon-wasm');
}

// Allows the jolteon library to be loaded and awaited
export async function loadJolteon() {
	let wasm: JolteanLibT | undefined;

	try {
		wasm = await loadJolteonUnsafe();

		console.log('successfully loaded jolteon/wasm');

		wasm?.init();
	} catch {
		console.log('failed to load wasm');
	}

	return wasm;
}

function loadAsyncHelper() {
	let wasm: JolteanLibT | undefined;

	async function loadWasm() {
		wasm = await loadJolteon();
	}

	loadWasm();

	return () => wasm;
}

// A function that will return jolteon if loaded globally or return undefined if not
export const getJolteonIfLoaded = loadAsyncHelper();
