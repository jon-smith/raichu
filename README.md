# raichu

React/Typescript/Electron/Rust based training data analysis software

## Folder structure

Typescript code is located in the src folder split into the following sub-directories:

- **main** Back-end code
- **renderer** Front-end code
- **ui** Generic front-end components
- **shared** Code shared between front and back end
- **state** Code for the redux store

Native (Rust) code is located in the native folder.

## Install

The rust back-end uses Neon bindings. See [https://neon-bindings.com/docs/getting-started/](https://neon-bindings.com/docs/getting-started/) for instructions to install pre-requisites.

To install the local dependencies:

```bash
npm install
```

## Usage

To build the native code:

```bash
npm run build-native
```

To build and run the electron app in dev mode, with hot-reload (excluding native code):

```bash
npm run start-dev
```

Alternatively, you can run each process individually by running the following **simultaneously** in different console tabs:

```bash
npm run start-renderer-dev
npm run start-main-dev
```

```bash
npm run start-dev
```

## Packaging

We use [Electron builder](https://www.electron.build/) to build and package the application. By default you can run the following to package for your current platform:

```bash
npm run dist
```

This will create a installer for your platform in the `releases` folder.

You can make builds for specific platforms (or multiple platforms) by using the options found [here](https://www.electron.build/cli). E.g. building for all platforms (Windows, Mac, Linux):

```bash
npm run dist -- -mwl
```

## Dev environment

The following VS code extensions are recommended:

- ESLint `dbaeumer.vscode-eslint`
- Prettier - Code formatter `esbenp.prettier-vscode`

## Husky and Prettier

This project comes with both Husky and Prettier setup to ensure a consistent code style.

To change the code style, you can change the configuration in `.prettierrc`.

In case you want to get rid of this, you can removing the following from `package.json`:

1. Remove `precommit` from the `scripts` section
1. Remove the `lint-staged` section
1. Remove `lint-staged`, `prettier`, `eslint-config-prettier`, and `husky` from the `devDependencies`

Also remove all mentions of Prettier from the `extends` section in `.eslintrc.json`.

## About this project

Set up using [electron-react-typescript](https://github.com/Robinfr/electron-react-typescript).
