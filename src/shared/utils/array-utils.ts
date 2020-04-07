export function filterNullAndUndefined<T>(input: Array<T | null | undefined>): T[] {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return input.filter(i => i !== null && i !== undefined).map(i => i!);
}
