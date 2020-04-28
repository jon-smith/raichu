export function filterNullAndUndefined<T>(input: readonly (T | null | undefined)[]): T[] {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return input.filter(i => i !== null && i !== undefined).map(i => i!);
}

export function areEqual<T>(a: readonly T[], b: readonly T[], pred: (a: T, b: T) => boolean) {
	return a.length === b.length && a.every((v, i) => pred(v, b[i]));
}

export function cumulative(input: number[]) {
	const copy = input.concat();

	for (let i = 1; i < input.length; i++) {
		copy[i] = copy[i - 1] + input[i];
	}
	return copy;
}
