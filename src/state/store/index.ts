import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { enableBatching } from 'redux-batched-actions';
import { rootReducer, RootState } from '../reducers';

const configureStore = (initialState?: RootState): Store<RootState | undefined> => {
	const enhancer = composeWithDevTools(applyMiddleware(...[]));

	const store = createStore(enableBatching(rootReducer), initialState, enhancer);

	if (typeof module.hot !== 'undefined') {
		module.hot.accept('../reducers', () => store.replaceReducer(rootReducer));
	}

	return store;
};

export default configureStore;
