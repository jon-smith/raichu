use neon::prelude::*;

fn greet(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello 👋 node, 💙 frm Rust 🍄"))
}

register_module!(mut cx, {
    cx.export_function("greet", greet)
});
