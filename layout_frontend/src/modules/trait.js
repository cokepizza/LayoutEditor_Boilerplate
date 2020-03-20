import { createAction, handleActions } from 'redux-actions';

const TRAIT_SETTING = 'trait/TRAIT_SETTING';
export const traitSetting = createAction(TRAIT_SETTING, payload => payload);

const initialState = {
    clickedKey: null,
}

export default handleActions({
    [TRAIT_SETTING]: (state, { payload: { clickedKey } }) => ({
        ...state,
        clickedKey,
    }),
}, initialState);