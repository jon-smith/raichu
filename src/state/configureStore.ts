import { enableBatching } from 'redux-batched-actions';
import { configureStore as toolkitConfigure } from '@reduxjs/toolkit';
import { rootReducer } from './reducers';

const makeReducer = () => enableBatching(rootReducer);

const configureStore = () => {
	const store = toolkitConfigure({ reducer: makeReducer(), devTools: true });

	if (typeof module.hot !== 'undefined') {
		module.hot.accept('./reducers', () => store.replaceReducer(makeReducer()));
	}

	return store;
};

export default configureStore;
