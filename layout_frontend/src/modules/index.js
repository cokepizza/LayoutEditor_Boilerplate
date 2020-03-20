import { combineReducers } from 'redux';
import undoHistoryReducer from '../undoMiddlewareBundle/reducer';
import layout from './layout';
import trait from './trait';
import cover from './cover';
import undo from './undo';

const rootReducer = combineReducers({
    layout,
    trait,
    cover,
    undo,
    undoHistory: undoHistoryReducer,
})

export default rootReducer;