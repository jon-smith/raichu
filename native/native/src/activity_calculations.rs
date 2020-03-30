
pub struct BestAverage {
    pub start_index: u64,
    pub average: f64,
}

pub struct BestAverageResult {
    pub distance: u64,
    pub best: Option<BestAverage>,
}

// Calculate the best average of the data points when the distance between indices is equal to the supplied distance
// Return results will be ordered by distance
pub fn best_averages_for_distances(
    data_points: Vec<f64>,
    distances: Vec<u64>,
) -> Vec<BestAverageResult> {
    struct IntermediateResult {
        pub distance: u64,
        pub max_sum: f64,
        pub start_index: Option<u64>,
    }

    let mut current_max_sums = distances
        .into_iter()
        .filter(|d| d > &0)
        .map(|d| IntermediateResult {
            distance: d,
            max_sum: 0.0,
            start_index: None,
        })
        .collect::<Vec<_>>();

    // Sort on distance
    current_max_sums.sort_by(|a, b| a.distance.cmp(&b.distance));

    for i in 0..data_points.len() {
        for current_max in &mut current_max_sums {
            let to_index = i + current_max.distance as usize - 1;
            if to_index < data_points.len() {
                let sum = data_points[i..=to_index].iter().sum::<f64>();
                if current_max.start_index.is_none() || sum > current_max.max_sum {
                    current_max.max_sum = sum;
                    current_max.start_index = Some(i as u64);
                }
            }
        }
    }

    // Convert to output results
    current_max_sums
        .into_iter()
        .map(|m| BestAverageResult {
            distance: m.distance,
            best: match m.start_index {
                Some(x) => Option::Some(BestAverage {
                    start_index: x,
                    average: m.max_sum / (m.distance as f64),
                }),
                None => None,
            },
        })
        .collect()
}
