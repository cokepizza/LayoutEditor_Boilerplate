import React from 'react';
import styled from 'styled-components';

const TextBlock = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: ${props => props.width + 'px'};
    height: ${props => props.height + 'px'};
    background-color: ${props => props.backgroundColor};
    overflow: ${props => props.overflow};
    resize: ${props => props.resize};
    cursor: pointer;
`;

const Text = ({ component, children, ...rest }) => {
    if(component) {
        console.log('Text~~');
        return (
            <TextBlock
                data-key={component.key}
                {...component.style}
                {...rest}
            >
                {children}
            </TextBlock>
        )
    } else {
        return (
            <TextBlock
                width={100}
                height={100}
                backgroundColor={'green'}
                draggable='true'
                data-type='Text'
            >
                {children}
            </TextBlock>
        )
    }
};

export default React.memo(Text, (prevProps, nextProps) => {
    return prevProps.component === nextProps.component;
});