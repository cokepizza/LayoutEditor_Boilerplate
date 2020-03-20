import React from 'react';
import styled from 'styled-components';
import component from '../../lib/component';

const CanvasBlock = styled.div`
    width:70%;
    height: auto;
    background-color: ivory;
`;

const Canvas = ({ components }) => {
    const Component = component[components[0].type];

    return (
        <CanvasBlock>
            <Component
                data-key={0}
                components={components}
                index='0'
            />
        </CanvasBlock>
    )
};

export default Canvas;