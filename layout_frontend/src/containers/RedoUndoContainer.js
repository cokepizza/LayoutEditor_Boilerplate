import React, { useCallback } from 'react';
import * as undoActions from '../undoMiddlewareBundle/actions';
import { useDispatch, useSelector } from 'react-redux';
import RedoUndo from '../components/cover/RedoUndo';
import { plusNum, minusNum } from '../modules/undo';

const RedoUndoContainer = () => {
    const dispatch = useDispatch();

    const { canUndo, canRedo, num } = useSelector(({ undo, undoHistory }) => ({
        canUndo: undoHistory.undoQueue.length > 0,
        canRedo: undoHistory.redoQueue.length > 0,
        num: undo.num,
    }));

    const onUndo = useCallback(() => {
        dispatch(undoActions.undo());
    }, [dispatch]);

    const onRedo = useCallback(() => {
        dispatch(undoActions.redo());
    }, [dispatch]);

    const onPlus = useCallback(() => {
        dispatch(plusNum());
    }, [dispatch]);

    const onMinus = useCallback(() => {
        dispatch(minusNum());
    }, [dispatch]);

    return (
        <RedoUndo
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={onUndo}
            onRedo={onRedo}
            onPlus={onPlus}
            onMinus={onMinus}
            num={num}
        />
    );
};

export default RedoUndoContainer;