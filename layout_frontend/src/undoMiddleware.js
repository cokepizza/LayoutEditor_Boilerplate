import createUndoMiddleware from './undoMiddlewareBundle/createUndoMiddleware';
import { PLUS_NUM, MINUS_NUM, plusNum, minusNum, } from './modules/undo';
import { CHANGE_COMPONENT, DETACH_COMPONENT, ATTACH_COMPONENT, MOVE_COMPONENT, DROP_COMPONENT, CLONE_COMPONENT } from './modules/layout';

export default createUndoMiddleware({
    revertingActions: {
        [PLUS_NUM]: (action) => {
            console.dir(action);
            return minusNum();
        },
        [MINUS_NUM]: (action) => {
            console.dir(action);
            return plusNum();
        },
        [CHANGE_COMPONENT]: {
            action: (action) => {
                console.dir(action);
                const { undoThunk, redoThunk, ...rest } = action.payload;
                return undoThunk({ ...rest.undoParam });
            }
        },
        [DETACH_COMPONENT]: {
            action: action => {
                console.dir('Detach_Component_Reverting');
                const { undoThunk, redoThunk, ...rest } = action.payload;
                return undoThunk({ ...rest.undoParam });
            }
        },
        [ATTACH_COMPONENT]: {
            action: action => {
                console.dir('Attach_Component_Reverting');
                const { undoThunk, redoThunk, ...rest } = action.payload;
                return undoThunk({ ...rest.undoParam });
            }
        },
        [MOVE_COMPONENT]: {
            action: action => {
                console.dir('Move_Component_Reverting');
                const { undoThunk, redoThunk, ...rest } = action.payload;
                return undoThunk({ ...rest.undoParam });
            }
        },
        [CLONE_COMPONENT]: {
            action: action => {
                console.dir('CLONE_Component_Reverting');
                const { undoThunk, redoThunk, ...rest } = action.payload;
                return undoThunk({ ...rest.undoParam });
            }
        },
        [DROP_COMPONENT]: {
            action: action => {
                console.dir('Drop_Component_Reverting');
                const { undoThunk, redoThunk, ...rest } = action.payload;
                return undoThunk({ ...rest.undoParam });
            }
        }
    }
});