use neon::prelude::*;

mod activity_calculations
{
    pub struct BestAverage {
        pub start_index: u64,
        pub average: f64,
    }

    pub struct BestAverageResult {
        pub distance: u64,
        pub best: Option<BestAverage>,
    }
}

use crate::activity_calculations::BestAverage;
use crate::activity_calculations::BestAverageResult;

fn convert_to_js(mut cx: FunctionContext, result: BestAverageResult) -> JsResult<JsObject> {

    let js_best = JsObject::new(&mut cx);

    match result.best{
        Some(x) =>
        {
            let start_index = cx.number(x.start_index as f64);
            let average =  cx.number(x.average);
            js_best.set(&mut cx, "startIndex", start_index).unwrap();
            js_best.set(&mut cx, "average", average).unwrap();
        }
        None => {}
    }

    let js_result = JsObject::new(&mut cx);

    js_result.set(&mut cx, "best", js_best).unwrap();
    let js_distance = cx.number(result.distance as f64);
    js_result.set(&mut cx, "distance", js_distance).unwrap();

    Ok(js_best)
}

fn best_averages_for_distances(cx: FunctionContext) -> JsResult<JsObject> {

    let result = BestAverageResult {
        distance: 10,
        best: Option::Some(BestAverage{
            start_index: 0,
            average: 50.6
        })
    };

    convert_to_js(cx, result)
}

fn greet(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello 👋 node, 💙 frm Rust 🍄"))
}

register_module!(mut cx, { 
    cx.export_function("greet", greet)?;
    cx.export_function("bestAveragesForDistances", best_averages_for_distances)?;
    Ok(())
});