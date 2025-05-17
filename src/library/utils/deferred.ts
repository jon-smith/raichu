// Creates a Promise<void> that will block until resolve is called
export function makeDeferred() {
	type Deferred = { promise: Promise<void>; resolve: () => void };
	const deferred: Partial<Deferred> = {};
	deferred.promise = new Promise((resolve) => {
		deferred.resolve = resolve;
	});
	return deferred as Deferred;
}
