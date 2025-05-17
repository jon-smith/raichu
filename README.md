# raichu

A simple web-app for viewing and analysing GPX/TCX data. Written using [Typescript](https://www.typescriptlang.org/), [React](https://reactjs.org/)
([Create React App](https://github.com/facebook/create-react-app)), [Redux](https://redux.js.org/), [Rust and WebAssembly](https://rustwasm.github.io/).

## Prerequisites

The Rust toolchain and `wasm-pack` is required to build the Rust/Webassembly code located in the rust-wasm directory. See the [`wasm-pack` documentation](https://rustwasm.github.io/wasm-pack/book/quickstart.html) for more information.

To install `wasm-pack`:

```sh
npm install -g wasm-pack
```

## Build/Test/Run

### Wasm Library

#### `npm run build-wasm`

Compiles the Rust code and builds WebAssembly modules for both the web-app (found in `rust-wasm/pkg`) and testing (found in `rust-wasm/pkg-node`). The latter is necessary because Jest runs in node.

#### `npm run test-native`

Runs the native unit tests in the Rust code using `cargo test`.

### Web App

> Note this is a legacy project and the following commands need to be prefixed with `NODE_OPTIONS=--openssl-legacy-provider` if running a recent version of Node (17+).

#### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## About

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

WebAssembly modules created with [Rust](https://www.rust-lang.org/) and [wasm-pack](https://rustwasm.github.io/wasm-pack/) using the [wasm-pack-template](https://github.com/rustwasm/wasm-pack).
