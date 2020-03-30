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
        
        // Create empty results
        let mut results: Vec<BestAverageResult> = distances
            .into_iter()
            .map(|d| BestAverageResult {
                distance: d,
                best: Option::None,
            })
            .collect();

        // Sort on distance
        results.sort_by(|a, b| b.distance.cmp(&a.distance));



        results
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

    js_best
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
    
    /*let result = BestAverageResult {
        distance: 10,
        best: Option::Some(BestAverage {
            start_index: 0,
            average: 50.6,
        }),
    };

    let results = vec![result];*/

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
