import React, { useEffect } from 'react';
import styled from 'styled-components';
import ComponentRendererContainer from './ComponentRendererContainer';

const CanvasRendererBlock = styled.div`
    width:70%;
    height: auto;
    background-color: ivory;
`;

const CanvasRenderer = () => {

    return (
        <CanvasRendererBlock>
            <ComponentRendererContainer
                index={0}
            />
        </CanvasRendererBlock>
    )
};

export default CanvasRenderer;