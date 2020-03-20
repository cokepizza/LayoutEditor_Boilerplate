import React from 'react';
import styled from 'styled-components';

const IconBlock = styled.div`
    width: ${props => props.width + 'px'};
    height: ${props => props.height + 'px'};
    background-color: ${props => props.backgroundColor};
    display: flex;
    justify-content: space-around;
    align-items: center;
    cursor: pointer;
    
`;

const Icon = ({ component, index, ...rest }) => {
    if(component) {
        return (
            <IconBlock
                data-key={index}
                {...component.style}
            >
                {rest.children}
            </IconBlock>
        )
    } else {
        return (
            <IconBlock
                width={100}
                height={100}
                backgroundColor={'yellow'}
                draggable='true'
                data-type='Icon'
            >
                {rest.children}
            </IconBlock>
        )
    }
};

export default React.memo(Icon);
