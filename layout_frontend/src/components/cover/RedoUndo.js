import React from 'react';
import styled, { css } from 'styled-components';

const RedoUndoFormBlock = styled.div`
    display: flex;
`;

const buttonStyle = css`
    background-color: gray;
    width: 100px;
    height: 100px;
    outline: none;
`

const RedoButton = styled.button`
    ${buttonStyle}
`;

const UndoButton = styled.button`
    ${buttonStyle}
`;

const PlusButtonBlock = styled.button`
    ${buttonStyle}
`;

const MinusButtonBlock = styled.button`
    ${buttonStyle}
`;

const NumBlock = styled.button`
    ${buttonStyle}
`;

const RedoUndo = ({ canUndo, canRedo, onUndo, onRedo, onPlus, onMinus, num }) => {
    return (
        <>
            <RedoUndoFormBlock>
                <UndoButton
                    onClick={onUndo}
                    disabled={!canUndo}
                >
                    Undo
                </UndoButton>
                <RedoButton
                    onClick={onRedo}
                    disabled={!canRedo}
                >
                    Redo
                </RedoButton>
                <PlusButtonBlock onClick={onPlus}>
                    +
                </PlusButtonBlock>
                <MinusButtonBlock onClick={onMinus}>
                    -
                </MinusButtonBlock>
                <NumBlock>
                    {num}
                </NumBlock>
            </RedoUndoFormBlock>
        </>
    )
};

export default React.memo(RedoUndo);