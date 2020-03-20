import { handleActions } from 'redux-actions';
import componentConverter from '../lib/componentConverter';

const initialState = {
    list: Object.keys(componentConverter),
};

export default handleActions({

}, initialState);