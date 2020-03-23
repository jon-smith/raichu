import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import { rootReducer, RootState } from '../reducers';

const configureStore = (initialState?: RootState): Store<RootState | undefined> => {
	const middlewares: any[] = [];
	const enhancer = composeWithDevTools(applyMiddleware(...middlewares));

	if (typeof module.hot !== 'undefined') {
		module.hot.accept('../reducers', () => store.replaceReducer(rootReducer));
	}

	const store = createStore(rootReducer, initialState, enhancer);
	return store;
};

export default configureStore;
