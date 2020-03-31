#[macro_use]
extern crate neon_serde;

use neon::prelude::*;

use jolteon_impl::activity_calculator;

export! {

    fn greet() -> String {
        "hello 👋 node, 💙 frm Rust 🍄".into()
    }

    fn best_averages_for_distances(data_points: Vec<Option<f64>>, distances: Vec<u64>) -> Vec<activity_calculator::BestAverageResult> {

        let replace_empty = data_points.into_iter().map(|v| match v { Some(x) => x, None => 0.0}).collect::<Vec<_>>();
        activity_calculator::best_averages_for_distances(&replace_empty, &distances)
    }

}
