
export type BestAverage = {
	startIndex: number,
	average: number
}

export type Result = {
	distance: number,
	best: BestAverage | null
};

const sumRange= (values: number[], from: number, n: number) => {

	let sum = 0;
	const to = Math.max(values.length, values.length - from + n);
	for (let i=from; i<to; ++i)
	{
		sum += values[i];
	}
	return sum;
}

// Calculate the best average of the data points when the distance between indices is equal to the supplied distance
// Return results will be ordered by distance
export const bestAveragesForDistances = <T>(dataPoints: (number | null)[], distances: number[]): Result[] =>
{
	if (distances.length == 0)
		return [];

	let currentMaxSumsForDistances = distances
		.map(distance => ({distance, bestSum: 0, bestIndex: null as (number | null) }))
		.sort((a, b) => a.distance - b.distance);

	const dataPointsNullAsZero = dataPoints.map(d => d || 0);
	for (let i = 0; i < dataPointsNullAsZero.length; ++i)
	{
		currentMaxSumsForDistances = currentMaxSumsForDistances.map(b =>
			{
				const compareIndex = i + b.distance;
				if (compareIndex < dataPointsNullAsZero.length)
				{
					const sum = sumRange(dataPointsNullAsZero, i, b.distance);
					if (b.bestIndex == null || sum > b.bestSum)
					{
						return ({distance: b.distance, bestSum: sum, bestIndex: i})
					}
				}
				return b;
			});
	}

	return currentMaxSumsForDistances.map(b => ({
		distance : b.distance, 
		best: b.bestIndex == null ?
			null : ({startIndex: b.bestIndex, average: b.bestSum / b.distance}) 
	}));
};