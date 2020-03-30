use neon::prelude::*;

mod activity_calculations;

fn convert_to_js<'a>(
    cx: &mut FunctionContext<'a>,
    result: &activity_calculations::BestAverageResult,
) -> Handle<'a, JsObject> {

    let js_result = JsObject::new(cx);

    match &result.best {
        Some(x) => {
            let js_best = JsObject::new(cx);

            let start_index = cx.number(x.start_index as f64);
            let average = cx.number(x.average);
            js_best.set(cx, "startIndex", start_index).unwrap();
            js_best.set(cx, "average", average).unwrap();

            js_result.set(cx, "best", js_best).unwrap();
        }
        None => {
            let null = cx.null();
            js_result.set(cx, "best", null).unwrap();
        }
    }

    let js_distance = cx.number(result.distance as f64);
    js_result.set(cx, "distance", js_distance).unwrap();

    js_result
}

fn to_native_f64_vec(
    cx: &mut FunctionContext,
    js_array: Handle<JsArray>,
    default: f64,
) -> NeonResult<Vec<f64>> {
    let vec_of_js_values: Vec<Handle<JsValue>> = js_array.to_vec(cx)?;

    let vec_of_numbers = vec_of_js_values
        .into_iter()
        .map(|js_value| {
            js_value
                .downcast::<JsNumber>()
                .unwrap_or(cx.number(default))
                .value()
        })
        .collect();

    Ok(vec_of_numbers)
}

fn to_native_u64_vec(
    cx: &mut FunctionContext,
    js_array: Handle<JsArray>,
    default: u64,
) -> NeonResult<Vec<u64>> {
    let f64_vec = to_native_f64_vec(cx, js_array, default as f64);

    let u64_vec = f64_vec?.into_iter().map(|d| d as u64).collect();

    Ok(u64_vec)
}

fn best_averages_for_distances(mut cx: FunctionContext) -> JsResult<JsArray> {
    let data_points_arg: Handle<JsArray> = cx.argument(0)?;
    let data_points_vec = to_native_f64_vec(&mut cx, data_points_arg, 0.0);

    let distances_arg: Handle<JsArray> = cx.argument(1)?;
    let distances_vec = to_native_u64_vec(&mut cx, distances_arg, 0);

    let results =
        activity_calculations::best_averages_for_distances(&data_points_vec?, &distances_vec?);

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
