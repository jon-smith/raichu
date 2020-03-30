use neon::prelude::*;

mod activity_calculations {
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
            pub start_index: Option<u64>
        }

        let mut current_max_sums = distances
            .into_iter()
            .filter(|d| d > &0)
            .map(|d| IntermediateResult {
                distance: d,
                max_sum: 0.0,
                start_index: None
            })
            .collect::<Vec<_>>();

        // Sort on distance
        current_max_sums.sort_by(|a, b| a.distance.cmp(&b.distance));

        for i in 0..data_points.len() {
            for current_max in & mut current_max_sums{
                let to_index = i + current_max.distance as usize - 1;
                if to_index < data_points.len()
                {
                    let sum = data_points[i..=to_index].iter().sum::<f64>();
                    if current_max.start_index.is_none() || sum > current_max.max_sum
                    {
                        current_max.max_sum = sum;
                        current_max.start_index = Some(i as u64);
                    }
                }
            }
        }

        // Convert to output results
        current_max_sums.into_iter().map(|m| BestAverageResult {
            distance: m.distance,
            best: match m.start_index { 
                Some(x) => 
                Option::Some(BestAverage {
                start_index: x,
                average: m.max_sum / (m.distance as f64),
            }),
            None => None},
        }).collect()
    }
}

use crate::activity_calculations::BestAverage;
use crate::activity_calculations::BestAverageResult;

fn convert_to_js<'a>(
    cx: &mut FunctionContext<'a>,
    result: &BestAverageResult,
) -> Handle<'a, JsObject> {
    let js_best = JsObject::new(cx);

    match &result.best {
        Some(x) => {
            let start_index = cx.number(x.start_index as f64);
            let average = cx.number(x.average);
            js_best.set(cx, "startIndex", start_index).unwrap();
            js_best.set(cx, "average", average).unwrap();
        }
        None => {}
    }

    let js_result = JsObject::new(cx);

    js_result.set(cx, "best", js_best).unwrap();
    let js_distance = cx.number(result.distance as f64);
    js_result.set(cx, "distance", js_distance).unwrap();

    js_result
}

fn to_native_f64_vec(cx: &mut FunctionContext, js_array: Handle<JsArray>, default: f64) -> NeonResult<Vec<f64>> {

    let vec_of_js_values: Vec<Handle<JsValue>> = js_array.to_vec(cx)?;

    let vec_of_numbers = vec_of_js_values.into_iter().map(|js_value| {
        js_value
            .downcast::<JsNumber>()
            .unwrap_or(cx.number(default))
            .value()
    })
    .collect();

    Ok(vec_of_numbers)
}

fn to_native_u64_vec(cx: &mut FunctionContext, js_array: Handle<JsArray>, default: u64) -> NeonResult<Vec<u64>> {

    let f64_vec = to_native_f64_vec(cx, js_array, default as f64);

    let u64_vec = f64_vec?.into_iter().map(|d| d as u64).collect();

    Ok(u64_vec)
}

fn best_averages_for_distances(mut cx: FunctionContext) -> JsResult<JsArray> {
    
    let data_points_arg: Handle<JsArray> = cx.argument(0)?;
    let data_points_vec = to_native_f64_vec(&mut cx, data_points_arg, 0.0);

    let distances_arg: Handle<JsArray> = cx.argument(1)?;
    let distances_vec = to_native_u64_vec(&mut cx, distances_arg, 0);

    let results = activity_calculations::best_averages_for_distances(data_points_vec?, distances_vec?);
    
    let js_results = JsArray::new(&mut cx, results.len() as u32);

    for (i, r) in results.iter().enumerate() {
        let js_obj = convert_to_js(&mut cx, r);
        js_results.set(&mut cx, i as u32, js_obj).unwrap();
    }

    Ok(js_results)
}

fn greet(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello 👋 node, 💙 frm Rust 🍄"))
}

register_module!(mut cx, {
    cx.export_function("greet", greet)?;
    cx.export_function("bestAveragesForDistances", best_averages_for_distances)?;
    Ok(())
});
