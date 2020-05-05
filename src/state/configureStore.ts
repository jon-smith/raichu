import { enableBatching } from 'redux-batched-actions';
import { configureStore as toolkitConfigure, getDefaultMiddleware } from '@reduxjs/toolkit';
import { rootReducer } from './reducers';

const makeReducer = () => enableBatching(rootReducer);

// Ignore gpx files because they are typically large datasets and slow the app down in dev mode
const middlewareIgnorePaths = ['workoutCreator.activity', 'activities.files'];

const configureStore = () => {
	const store = toolkitConfigure({
		reducer: makeReducer(),
		middleware: getDefaultMiddleware({
			serializableCheck: false,
			immutableCheck: { ignoredPaths: middlewareIgnorePaths }
		}),
		devTools: true
	});

	if (typeof module.hot !== 'undefined') {
		module.hot.accept('./reducers', () => store.replaceReducer(makeReducer()));
	}

	return store;
};

export default configureStore;
