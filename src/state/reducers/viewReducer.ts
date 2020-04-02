import { Reducer } from 'redux';
import { ViewAction, Page, SET_CURRENT_PAGE, DUMMY_ACTION } from '../actions/viewActions';

export interface ViewState {
	readonly currentPage: Page;
}

const defaultState: ViewState = {
	currentPage: 'data'
};

export const viewReducer: Reducer<ViewState> = (state = defaultState, action: ViewAction) => {
	switch (action.type) {
		case SET_CURRENT_PAGE:
			return {
				...state,
				currentPage: action.page
			};
		case DUMMY_ACTION:
			return state;
		default:
			return state;
	}
};
