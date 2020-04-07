export function filterNullAndUndefined<T>(input: Array<T | null | undefined>): T[] {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return input.filter(i => i !== null && i !== undefined).map(i => i!);
}

export function areEqual<T>(a: T[], b: T[], pred: (a: T, b: T) => boolean) {
	return a.length === b.length && a.every((v, i) => pred(v, b[i]));
}
