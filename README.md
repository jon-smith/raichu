# raichu
React/Typescript/Electron based training data analysis software

## Getting started

To install packages:
```bash
npm run install
```

To start Webpack in development mode and watch the changes on source files:
```bash
npm run dev
```
To start the application (in another terminal):
```bash
npm start
```

## Building the installer for the app
The boilerplate is currently configured to package & build the installer of 
your app for macOS & Windows using `electron-builder`. 

For macOS, execute:
```bash
npm run build:mac
```

For Windows, execute:
```bash
npm run build:win
```
_** `asar` archiving is disabled by default in Windows build as it can cause 
errors while running the installed Electron app based on pervious experiences, 
whereas the macOS build with `asar` enabled works just fine. You can turn it 
back on by removing line 23 (`"asar": false`) in `package.json`. **_

### Extra options
The build scripts are pre-configured to build 64 bit installers since 64 bit 
should be the standard for a modern applications. 32 bit builds are still 
possible by changing the build scripts in `package.json` as below:
```json
// from
"scripts": {
    ...
    "build:win": "electron-builder build --win --x64",
    "build:mac": "electron-builder build --mac --x64"
},

// to
"scripts": {
    ...
    "build:win": "electron-builder build --win --ia32",
    "build:mac": "electron-builder build --mac --ia32"
},
```

Builds for Linux, armv71, and arm64 can also be configured by modifying the 
build scripts in `package.json`, but those aren't tested yet. For details, 
please refer to [documents of `electron-builder`](https://www.electron.build/cli).