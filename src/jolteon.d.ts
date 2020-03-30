declare module 'jolteon' {
	type BestAverage = {
		startIndex: number;
		average: number;
	};

	type BestAverageResult = {
		distance: number;
		best: BestAverage | null;
	};

	const _: {
		greet(): string;
		bestAveragesForDistances(
			dataPoints: (number | null)[],
			distances: number[]
		): BestAverageResult[];
	};
	export = _;
}
