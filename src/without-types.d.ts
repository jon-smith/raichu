// Modules that dont have associated types are declared here
// This allows us to use noImplicitAny
declare module 'react-vis';
declare module 'jolteon';

declare module '*.jpg' {
	const value: any;
	export = value;
}
