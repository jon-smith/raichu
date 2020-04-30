import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { enableBatching } from 'redux-batched-actions';
import { rootReducer, RootState } from './reducers';

const makeReducer = () => enableBatching(rootReducer);

const configureStore = (initialState?: RootState): Store<RootState | undefined> => {
	const enhancer = composeWithDevTools(applyMiddleware(...[]));

	const store = createStore(makeReducer(), initialState, enhancer);

	if (typeof module.hot !== 'undefined') {
		module.hot.accept('./reducers', () => store.replaceReducer(makeReducer()));
	}

	return store;
};

export default configureStore;
