import React from 'react';
import styled from 'styled-components';
import NestedComponentRenderer from './NestedComponentRenderer';

const NestedCanvasRendererBlock = styled.div`
    width:70%;
    height: auto;
    background-color: ivory;
`;

const NestedCanvasRenderer = ({ component }) => {
    return (
        <NestedCanvasRendererBlock>
            <NestedComponentRenderer component={component} />
        </NestedCanvasRendererBlock>
    )
};

export default NestedCanvasRenderer;