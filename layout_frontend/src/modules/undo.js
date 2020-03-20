import { createAction, handleActions } from 'redux-actions';

export const PLUS_NUM = 'undo/PLUS_NUM';
export const MINUS_NUM = 'undo/MINUS_NUM';

export const plusNum = createAction(PLUS_NUM);
export const minusNum = createAction(MINUS_NUM);

const initialState = {
    num: 0,
}

export default handleActions({
    [PLUS_NUM]: state => ({
        ...state,
        num: state.num+1,
    }),
    [MINUS_NUM]: state => ({
        ...state,
        num: state.num-1,
    })
}, initialState);
