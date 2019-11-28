export function filterNullAndUndefined<T>(input: Array<T | null | undefined>): T[] {
	return input.filter((i) => i !== null && i !== undefined).map((i) => i!);
}
